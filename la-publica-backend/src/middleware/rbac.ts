import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import permissionService from '../services/permission.service';

/**
 * Middleware RBAC para verificar permisos granulares
 *
 * @param resource - Recurso a verificar (ej: 'blog-posts', 'users')
 * @param action - Acción a verificar (ej: 'create', 'read', 'update', 'delete')
 * @param options - Opciones adicionales
 */
export const checkPermission = (
  resource: string,
  action: string,
  options?: {
    checkOwnership?: boolean;
    ownerField?: string;
  }
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticació requerida per a aquesta acció.',
        });
        return;
      }

      const userId = req.user.userId;

      // SuperAdmin y Admin siempre tienen acceso (bypass)
      // Esto es temporal mientras migramos completamente al sistema RBAC
      if (req.user.role === 'superadmin' || req.user.role === 'admin') {
        next();
        return;
      }

      // Determinar el owner si se requiere verificar ownership
      let ownerId: string | undefined;

      if (options?.checkOwnership) {
        const ownerField = options.ownerField || 'userId';

        // Intentar obtener el owner del body
        if (req.body && req.body[ownerField]) {
          ownerId = req.body[ownerField];
        }

        // Intentar obtener el owner de los params
        if (!ownerId && req.params && req.params[ownerField]) {
          ownerId = req.params[ownerField];
        }

        // Si es una actualización/eliminación, obtener del recurso existente
        if (!ownerId && (action === 'update' || action === 'delete')) {
          // Esto requeriría que el controlador inyecte el ownerId
          // O que se obtenga del recurso en la base de datos
          // Por ahora, lo dejamos como está
        }
      }

      // Verificar el permiso
      const hasPermission = await permissionService.can(
        userId,
        resource,
        action,
        ownerId
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: 'No tens permisos suficients per realitzar aquesta acció.',
          details: {
            resource,
            action,
            required: `${resource}:${action}`,
          },
        });
        return;
      }

      // Agregar información de permisos a la request para uso posterior
      const scope = await permissionService.getPermissionScope(userId, resource, action);
      (req as any).permissionScope = scope;

      next();
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificant els permisos.',
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (AND lógico)
 * El usuario debe tener TODOS los permisos especificados
 */
export const checkAllPermissions = (
  checks: Array<{ resource: string; action: string }>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticació requerida per a aquesta acció.',
        });
        return;
      }

      const userId = req.user.userId;

      // SuperAdmin y Admin siempre tienen acceso
      if (req.user.role === 'superadmin' || req.user.role === 'admin') {
        next();
        return;
      }

      // Verificar todos los permisos
      const hasAllPermissions = await permissionService.canAll(
        userId,
        checks
      );

      if (!hasAllPermissions) {
        res.status(403).json({
          success: false,
          message: 'No tens tots els permisos necessaris per realitzar aquesta acció.',
          details: {
            required: checks.map(c => `${c.resource}:${c.action}`),
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificant els permisos.',
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR lógico)
 * El usuario debe tener AL MENOS UNO de los permisos especificados
 */
export const checkAnyPermission = (
  checks: Array<{ resource: string; action: string }>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticació requerida per a aquesta acció.',
        });
        return;
      }

      const userId = req.user.userId;

      // SuperAdmin y Admin siempre tienen acceso
      if (req.user.role === 'superadmin' || req.user.role === 'admin') {
        next();
        return;
      }

      // Verificar si tiene al menos uno de los permisos
      const hasAnyPermission = await permissionService.canAny(
        userId,
        checks
      );

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          message: 'No tens cap dels permisos necessaris per realitzar aquesta acció.',
          details: {
            required: checks.map(c => `${c.resource}:${c.action}`),
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificant els permisos.',
      });
    }
  };
};

/**
 * Middleware helper para aplicar filtros basados en scope
 * Modifica la query de mongoose según el scope del usuario
 */
export const applyScopeFilter = async (
  req: AuthenticatedRequest,
  resource: string,
  action: string,
  query: any,
  ownerField: string = 'userId'
): Promise<any> => {
  if (!req.user) {
    throw new Error('Usuari no autenticat');
  }

  const userId = req.user.userId;

  // SuperAdmin y Admin ven todo
  if (req.user.role === 'superadmin' || req.user.role === 'admin') {
    return query;
  }

  const scope = await permissionService.getPermissionScope(userId, resource, action);

  if (!scope || scope === 'none') {
    // Sin permiso, devolver query que no retorna nada
    return { _id: null };
  }

  if (scope === 'own') {
    // Solo sus propios recursos
    query[ownerField] = userId;
  }

  // scope 'all' no requiere filtro adicional
  // scope 'department' requeriría lógica adicional

  return query;
};

export default {
  checkPermission,
  checkAllPermissions,
  checkAnyPermission,
  applyScopeFilter,
};
