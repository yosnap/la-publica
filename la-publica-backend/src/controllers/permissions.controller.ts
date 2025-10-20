import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import Permission from '../permission.model';
import permissionService from '../services/permission.service';
import User from '../user.model';

/**
 * Controlador para gestión de permisos
 */
export class PermissionsController {
  /**
   * Obtiene todos los permisos disponibles
   * GET /api/admin/permissions
   */
  async getAllPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const { resourceGroup, isActive } = req.query;

      const query: any = {};

      if (resourceGroup) {
        query.resourceGroup = resourceGroup;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const permissions = await Permission.find(query)
        .sort({ resourceGroup: 1, resource: 1 })
        .lean();

      res.status(200).json({
        success: true,
        data: permissions,
        total: permissions.length,
      });
    } catch (error: any) {
      console.error('Error obtenint permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els permisos',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los permisos agrupados por resourceGroup
   * GET /api/admin/permissions/grouped
   */
  async getGroupedPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const permissions = await Permission.find({ isActive: true })
        .sort({ resourceGroup: 1, resource: 1 })
        .lean();

      // Agrupar por resourceGroup
      const grouped: Record<string, any[]> = {};

      permissions.forEach(permission => {
        if (!grouped[permission.resourceGroup]) {
          grouped[permission.resourceGroup] = [];
        }
        grouped[permission.resourceGroup].push(permission);
      });

      res.status(200).json({
        success: true,
        data: grouped,
      });
    } catch (error: any) {
      console.error('Error obtenint permisos agrupats:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els permisos agrupats',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los permisos de un usuario específico
   * GET /api/admin/permissions/user/:userId
   */
  async getUserPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuari no trobat',
        });
        return;
      }

      const permissions = await permissionService.getUserPermissions(userId);

      // Convertir Map a objeto para JSON
      const permissionsObj: Record<string, any> = {};
      permissions.forEach((value, key) => {
        permissionsObj[key] = value;
      });

      res.status(200).json({
        success: true,
        data: {
          userId,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          permissions: permissionsObj,
        },
      });
    } catch (error: any) {
      console.error('Error obtenint permisos d\'usuari:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els permisos de l\'usuari',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los permisos del usuario autenticado
   * GET /api/auth/my-permissions
   */
  async getMyPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      const userId = req.user.userId;
      const permissions = await permissionService.getUserPermissions(userId);

      // Convertir Map a objeto para JSON
      const permissionsObj: Record<string, any> = {};
      permissions.forEach((value, key) => {
        permissionsObj[key] = value;
      });

      res.status(200).json({
        success: true,
        data: {
          permissions: permissionsObj,
        },
      });
    } catch (error: any) {
      console.error('Error obtenint els meus permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els teus permisos',
        error: error.message,
      });
    }
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * POST /api/auth/check-permission
   */
  async checkPermission(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      const { resource, action, ownerId } = req.body;

      if (!resource || !action) {
        res.status(400).json({
          success: false,
          message: 'Els camps resource i action són obligatoris',
        });
        return;
      }

      const userId = req.user.userId;
      const hasPermission = await permissionService.can(userId, resource, action, ownerId);
      const scope = hasPermission ? await permissionService.getPermissionScope(userId, resource, action) : null;

      res.status(200).json({
        success: true,
        data: {
          hasPermission,
          scope,
          resource,
          action,
        },
      });
    } catch (error: any) {
      console.error('Error verificant permís:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificant el permís',
        error: error.message,
      });
    }
  }

  /**
   * Actualiza los role overrides de un usuario
   * PUT /api/admin/users/:userId/role-overrides
   */
  async updateUserRoleOverrides(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { roleOverrides } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      // Verificar permisos
      const canUpdate = await permissionService.can(req.user.userId, 'users', 'update');
      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: 'No tens permisos per actualitzar usuaris',
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuari no trobat',
        });
        return;
      }

      user.roleOverrides = roleOverrides;
      await user.save();

      // Invalidar cache
      permissionService.invalidateUserCache(userId);

      res.status(200).json({
        success: true,
        message: 'Permisos específics actualitzats correctament',
        data: user.roleOverrides,
      });
    } catch (error: any) {
      console.error('Error actualitzant role overrides:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualitzant els permisos específics',
        error: error.message,
      });
    }
  }

  /**
   * Invalida el cache de permisos de un usuario
   * POST /api/admin/permissions/invalidate-cache/:userId
   */
  async invalidateUserCache(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      // Solo superadmin o admin pueden invalidar cache
      if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tens permisos per aquesta acció',
        });
        return;
      }

      permissionService.invalidateUserCache(userId);

      res.status(200).json({
        success: true,
        message: 'Cache de permisos invalidada correctament',
      });
    } catch (error: any) {
      console.error('Error invalidant cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error invalidant la cache',
        error: error.message,
      });
    }
  }

  /**
   * Invalida todo el cache de permisos
   * POST /api/admin/permissions/invalidate-all-cache
   */
  async invalidateAllCache(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      // Solo superadmin puede invalidar todo el cache
      if (req.user.role !== 'superadmin') {
        res.status(403).json({
          success: false,
          message: 'No tens permisos per aquesta acció',
        });
        return;
      }

      permissionService.invalidateAllCache();

      res.status(200).json({
        success: true,
        message: 'Tota la cache de permisos ha estat invalidada',
      });
    } catch (error: any) {
      console.error('Error invalidant tota la cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error invalidant tota la cache',
        error: error.message,
      });
    }
  }
}

export default new PermissionsController();
