import Role, { IRole, IResourcePermission } from '../role.model';
import User from '../user.model';
import auditService from './audit.service';
import permissionService from './permission.service';
import mongoose from 'mongoose';

/**
 * Servicio de gestión de roles
 */
export class RoleService {
  /**
   * Crea un nuevo rol
   */
  async createRole(
    data: {
      name: string;
      description?: string;
      permissions?: IResourcePermission[];
      priority?: number;
    },
    createdBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<IRole> {
    // Validar que el usuario tenga permisos para crear roles
    const canCreate = await permissionService.can(createdBy, 'roles', 'create');
    if (!canCreate) {
      throw new Error('No tens permisos per crear rols');
    }

    const role = await Role.create({
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
      priority: data.priority || 1,
      isSystemRole: false,
      isActive: true,
      createdBy,
    });

    // Registrar auditoría
    await auditService.log({
      action: 'role_created',
      roleId: role._id as string,
      roleName: role.name,
      performedBy: createdBy,
      changes: {
        newValue: {
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          priority: role.priority,
        },
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return role;
  }

  /**
   * Actualiza un rol existente
   */
  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissions?: IResourcePermission[];
      priority?: number;
      isActive?: boolean;
    },
    updatedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<IRole> {
    // Validar que el usuario tenga permisos
    const canUpdate = await permissionService.can(updatedBy, 'roles', 'update');
    if (!canUpdate) {
      throw new Error('No tens permisos per actualitzar rols');
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Rol no trobat');
    }

    // No permitir modificar roles del sistema (excepto superadmin)
    const user = await User.findById(updatedBy);
    if (role.isSystemRole && user?.role !== 'superadmin') {
      throw new Error('Els rols del sistema només poden ser modificats per superadministradors');
    }

    // Guardar valores antiguos para auditoría
    const oldValues: any = {};
    const changes: any = {};

    if (data.name && data.name !== role.name) {
      oldValues.name = role.name;
      changes.name = data.name;
      role.name = data.name;
    }

    if (data.description !== undefined && data.description !== role.description) {
      oldValues.description = role.description;
      changes.description = data.description;
      role.description = data.description;
    }

    if (data.permissions) {
      oldValues.permissions = role.permissions;
      changes.permissions = data.permissions;
      role.permissions = data.permissions;
    }

    if (data.priority !== undefined && data.priority !== role.priority) {
      oldValues.priority = role.priority;
      changes.priority = data.priority;
      role.priority = data.priority;
    }

    if (data.isActive !== undefined && data.isActive !== role.isActive) {
      oldValues.isActive = role.isActive;
      changes.isActive = data.isActive;
      role.isActive = data.isActive;
    }

    await role.save();

    // Invalidar cache de permisos de usuarios con este rol
    await this.invalidateRoleCache(roleId);

    // Registrar auditoría
    if (Object.keys(changes).length > 0) {
      await auditService.log({
        action: 'role_updated',
        roleId: role._id as string,
        roleName: role.name,
        performedBy: updatedBy,
        changes: {
          oldValue: oldValues,
          newValue: changes,
        },
        ipAddress: auditData?.ipAddress,
        userAgent: auditData?.userAgent,
      });
    }

    return role;
  }

  /**
   * Elimina un rol (soft delete)
   */
  async deleteRole(
    roleId: string,
    deletedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const canDelete = await permissionService.can(deletedBy, 'roles', 'delete');
    if (!canDelete) {
      throw new Error('No tens permisos per eliminar rols');
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Rol no trobat');
    }

    if (role.isSystemRole) {
      throw new Error('Els rols del sistema no es poden eliminar');
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await User.countDocuments({
      customRoles: roleId,
    });

    if (usersWithRole > 0) {
      throw new Error(`No es pot eliminar el rol perquè ${usersWithRole} usuari(s) el tenen assignat`);
    }

    // Soft delete (desactivar)
    role.isActive = false;
    await role.save();

    // Registrar auditoría
    await auditService.log({
      action: 'role_deleted',
      roleId: role._id as string,
      roleName: role.name,
      performedBy: deletedBy,
      changes: {
        oldValue: { isActive: true },
        newValue: { isActive: false },
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Clona un rol existente
   */
  async cloneRole(
    roleId: string,
    newName: string,
    clonedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<IRole> {
    const canCreate = await permissionService.can(clonedBy, 'roles', 'create');
    if (!canCreate) {
      throw new Error('No tens permisos per crear rols');
    }

    const sourceRole = await Role.findById(roleId);
    if (!sourceRole) {
      throw new Error('Rol original no trobat');
    }

    const clonedRole = await Role.create({
      name: newName,
      description: `Clonat de ${sourceRole.name}`,
      permissions: sourceRole.permissions,
      priority: sourceRole.priority,
      isSystemRole: false,
      isActive: true,
      createdBy: clonedBy,
    });

    // Registrar auditoría
    await auditService.log({
      action: 'role_cloned',
      roleId: clonedRole._id as string,
      roleName: clonedRole.name,
      performedBy: clonedBy,
      changes: {
        sourceRoleId: sourceRole._id,
        sourceRoleName: sourceRole.name,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return clonedRole;
  }

  /**
   * Obtiene todos los roles
   */
  async getRoles(options?: {
    includeInactive?: boolean;
    includeSystem?: boolean;
    page?: number;
    limit?: number;
  }) {
    const query: any = {};

    if (!options?.includeInactive) {
      query.isActive = true;
    }

    if (options?.includeSystem === false) {
      query.isSystemRole = false;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const roles = await Role.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    const total = await Role.countDocuments(query);

    return {
      roles,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un rol por ID
   */
  async getRoleById(roleId: string): Promise<IRole | null> {
    return await Role.findById(roleId)
      .populate('createdBy', 'firstName lastName email')
      .lean() as IRole | null;
  }

  /**
   * Asigna un rol a un usuario
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const canUpdate = await permissionService.can(assignedBy, 'users', 'update');
    if (!canUpdate) {
      throw new Error('No tens permisos per assignar rols');
    }

    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      throw new Error('Rol no trobat o inactiu');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuari no trobat');
    }

    // Verificar si ya tiene el rol
    if (user.customRoles?.some((r: any) => r.toString() === roleId)) {
      throw new Error('L\'usuari ja té aquest rol assignat');
    }

    // Agregar rol
    if (!user.customRoles) {
      user.customRoles = [];
    }
    user.customRoles.push(new mongoose.Types.ObjectId(roleId));
    await user.save();

    // Invalidar cache
    permissionService.invalidateUserCache(userId);

    // Registrar auditoría
    await auditService.log({
      action: 'role_assigned_to_user',
      roleId: role._id as string,
      roleName: role.name,
      performedBy: assignedBy,
      changes: {
        userId,
        userEmail: user.email,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Remueve un rol de un usuario
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    removedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const canUpdate = await permissionService.can(removedBy, 'users', 'update');
    if (!canUpdate) {
      throw new Error('No tens permisos per eliminar rols');
    }

    const role = await Role.findById(roleId);
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Usuari no trobat');
    }

    // Remover rol
    user.customRoles = user.customRoles?.filter((r: any) => r.toString() !== roleId) || [];
    await user.save();

    // Invalidar cache
    permissionService.invalidateUserCache(userId);

    // Registrar auditoría
    await auditService.log({
      action: 'role_removed_from_user',
      roleId: role?._id as string,
      roleName: role?.name,
      performedBy: removedBy,
      changes: {
        userId,
        userEmail: user.email,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Invalida el cache de permisos de todos los usuarios con un rol
   */
  private async invalidateRoleCache(roleId: string): Promise<void> {
    // Encontrar todos los usuarios con este rol
    const users = await User.find({
      $or: [
        { customRoles: roleId },
        { role: await Role.findById(roleId).then(r => r?.slug) },
      ],
    }).select('_id');

    // Invalidar cache de cada usuario
    users.forEach(user => {
      permissionService.invalidateUserCache((user._id as any).toString());
    });
  }
}

export default new RoleService();
