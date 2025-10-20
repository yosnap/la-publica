import Role, { IRole, IResourcePermission } from '../role.model';
import User, { IUser } from '../user.model';
import NodeCache from 'node-cache';

// Cache de permisos (TTL de 5 minutos)
const permissionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Servicio de gestión de permisos
 */
export class PermissionService {
  /**
   * Obtiene todos los permisos efectivos de un usuario
   * Combina permisos de:
   * 1. Rol base (campo 'role')
   * 2. Roles personalizados (campo 'customRoles')
   * 3. Overrides de usuario (campo 'roleOverrides')
   */
  async getUserPermissions(userId: string): Promise<Map<string, IResourcePermission>> {
    // Verificar cache
    const cacheKey = `permissions:${userId}`;
    const cached = permissionCache.get<Map<string, IResourcePermission>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Obtener usuario con roles poblados
    const user = await User.findById(userId)
      .populate('customRoles')
      .lean() as any as IUser & { customRoles: IRole[] };

    if (!user) {
      throw new Error('Usuari no trobat');
    }

    const permissionsMap = new Map<string, IResourcePermission>();

    // 1. Obtener permisos del rol base (compatibilidad)
    if (user.role) {
      const baseRole = await Role.findOne({ slug: user.role, isActive: true }).lean();
      if (baseRole) {
        this.mergePermissions(permissionsMap, baseRole.permissions, baseRole.priority);
      }
    }

    // 2. Obtener permisos de roles personalizados
    if (user.customRoles && user.customRoles.length > 0) {
      // Ordenar por prioridad (mayor prioridad primero)
      const sortedRoles = [...user.customRoles].sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const role of sortedRoles) {
        if (role.isActive) {
          this.mergePermissions(permissionsMap, role.permissions, role.priority);
        }
      }
    }

    // 3. Aplicar overrides de usuario (máxima prioridad)
    if (user.roleOverrides && user.roleOverrides.length > 0) {
      this.mergePermissions(permissionsMap, user.roleOverrides, 1000);
    }

    // Guardar en cache
    permissionCache.set(cacheKey, permissionsMap);

    return permissionsMap;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async can(
    userId: string,
    resource: string,
    action: string,
    ownerId?: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const permission = permissions.get(resource);

    if (!permission) {
      return false;
    }

    // Verificar si la acción está permitida
    const actionAllowed = permission.actions[action as keyof typeof permission.actions] === true;
    if (!actionAllowed) {
      return false;
    }

    // Verificar scope
    if (permission.scope === 'all') {
      return true;
    }

    if (permission.scope === 'own') {
      // Si no se proporciona ownerId, asumimos que el usuario está accediendo a su propio recurso
      if (!ownerId) {
        return true;
      }
      return userId === ownerId;
    }

    if (permission.scope === 'none') {
      return false;
    }

    // scope 'department' requeriría lógica adicional de grupos/departamentos
    return false;
  }

  /**
   * Verifica múltiples permisos a la vez
   */
  async canAll(
    userId: string,
    checks: Array<{ resource: string; action: string; ownerId?: string }>
  ): Promise<boolean> {
    for (const check of checks) {
      const allowed = await this.can(userId, check.resource, check.action, check.ownerId);
      if (!allowed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos
   */
  async canAny(
    userId: string,
    checks: Array<{ resource: string; action: string; ownerId?: string }>
  ): Promise<boolean> {
    for (const check of checks) {
      const allowed = await this.can(userId, check.resource, check.action, check.ownerId);
      if (allowed) {
        return true;
      }
    }
    return false;
  }

  /**
   * Obtiene el scope de un permiso específico
   */
  async getPermissionScope(
    userId: string,
    resource: string,
    action: string
  ): Promise<string | null> {
    const permissions = await this.getUserPermissions(userId);
    const permission = permissions.get(resource);

    if (!permission) {
      return null;
    }

    const actionAllowed = permission.actions[action as keyof typeof permission.actions] === true;
    if (!actionAllowed) {
      return null;
    }

    return permission.scope;
  }

  /**
   * Invalida el cache de permisos de un usuario
   */
  invalidateUserCache(userId: string): void {
    const cacheKey = `permissions:${userId}`;
    permissionCache.del(cacheKey);
  }

  /**
   * Invalida todo el cache de permisos
   */
  invalidateAllCache(): void {
    permissionCache.flushAll();
  }

  /**
   * Fusiona permisos con resolución de conflictos basada en prioridad
   * Si hay conflicto, gana el permiso de mayor prioridad
   */
  private mergePermissions(
    target: Map<string, IResourcePermission & { priority?: number }>,
    source: IResourcePermission[],
    priority: number
  ): void {
    for (const permission of source) {
      const existing = target.get(permission.resource);

      if (!existing) {
        // No existe, agregar directamente
        target.set(permission.resource, { ...permission, priority });
      } else {
        // Existe, resolver por prioridad
        if (priority > (existing.priority || 0)) {
          // La nueva tiene mayor prioridad, reemplazar
          target.set(permission.resource, { ...permission, priority });
        } else if (priority === (existing.priority || 0)) {
          // Misma prioridad, fusionar acciones (OR lógico)
          const mergedActions = { ...existing.actions };
          for (const [action, value] of Object.entries(permission.actions)) {
            if (value === true) {
              mergedActions[action as keyof typeof mergedActions] = true;
            }
          }

          // Usar el scope más permisivo
          let mergedScope = existing.scope;
          if (this.isScopeMorePermissive(permission.scope, existing.scope)) {
            mergedScope = permission.scope;
          }

          target.set(permission.resource, {
            ...existing,
            actions: mergedActions,
            scope: mergedScope,
            priority,
          });
        }
        // Si la prioridad es menor, no hacer nada
      }
    }
  }

  /**
   * Compara dos scopes y devuelve true si el primero es más permisivo
   */
  private isScopeMorePermissive(scope1: string, scope2: string): boolean {
    const scopeHierarchy = { none: 0, own: 1, department: 2, all: 3 };
    return scopeHierarchy[scope1 as keyof typeof scopeHierarchy] >
           scopeHierarchy[scope2 as keyof typeof scopeHierarchy];
  }
}

export default new PermissionService();
