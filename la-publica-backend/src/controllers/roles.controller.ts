import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import roleService from '../services/role.service';
import auditService from '../services/audit.service';
import { IResourcePermission } from '../role.model';

/**
 * Controlador para gestión de roles
 */
export class RolesController {
  /**
   * Obtiene todos los roles
   * GET /api/admin/roles
   */
  async getAllRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { includeInactive, includeSystem, page, limit } = req.query;

      const result = await roleService.getRoles({
        includeInactive: includeInactive === 'true',
        includeSystem: includeSystem !== 'false', // Por defecto true
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      });

      res.status(200).json({
        success: true,
        data: result.roles,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
        },
      });
    } catch (error: any) {
      console.error('Error obtenint rols:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els rols',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene un rol por ID
   * GET /api/admin/roles/:id
   */
  async getRoleById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const role = await roleService.getRoleById(id);

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Rol no trobat',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error: any) {
      console.error('Error obtenint rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint el rol',
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo rol
   * POST /api/admin/roles
   */
  async createRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, permissions, priority } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'El nom del rol és obligatori',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      const role = await roleService.createRole(
        {
          name,
          description,
          permissions: permissions as IResourcePermission[],
          priority,
        },
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(201).json({
        success: true,
        data: role,
        message: 'Rol creat correctament',
      });
    } catch (error: any) {
      console.error('Error creant rol:', error);
      res.status(error.message.includes('permisos') ? 403 : 500).json({
        success: false,
        message: error.message || 'Error creant el rol',
      });
    }
  }

  /**
   * Actualiza un rol existente
   * PUT /api/admin/roles/:id
   */
  async updateRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, permissions, priority, isActive } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      const role = await roleService.updateRole(
        id,
        {
          name,
          description,
          permissions: permissions as IResourcePermission[],
          priority,
          isActive,
        },
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        data: role,
        message: 'Rol actualitzat correctament',
      });
    } catch (error: any) {
      console.error('Error actualitzant rol:', error);
      const statusCode = error.message.includes('permisos') ? 403 :
                        error.message.includes('no trobat') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error actualitzant el rol',
      });
    }
  }

  /**
   * Elimina un rol (soft delete)
   * DELETE /api/admin/roles/:id
   */
  async deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      await roleService.deleteRole(
        id,
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: 'Rol eliminat correctament',
      });
    } catch (error: any) {
      console.error('Error eliminant rol:', error);
      const statusCode = error.message.includes('permisos') ? 403 :
                        error.message.includes('no trobat') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error eliminant el rol',
      });
    }
  }

  /**
   * Clona un rol existente
   * POST /api/admin/roles/:id/clone
   */
  async cloneRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'El nom del nou rol és obligatori',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      const role = await roleService.cloneRole(
        id,
        name,
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(201).json({
        success: true,
        data: role,
        message: 'Rol clonat correctament',
      });
    } catch (error: any) {
      console.error('Error clonant rol:', error);
      res.status(error.message.includes('permisos') ? 403 : 500).json({
        success: false,
        message: error.message || 'Error clonant el rol',
      });
    }
  }

  /**
   * Asigna un rol a un usuario
   * POST /api/admin/users/:userId/roles
   */
  async assignRoleToUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        res.status(400).json({
          success: false,
          message: 'El roleId és obligatori',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      await roleService.assignRoleToUser(
        userId,
        roleId,
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: 'Rol assignat correctament',
      });
    } catch (error: any) {
      console.error('Error assignant rol:', error);
      res.status(error.message.includes('permisos') ? 403 : 500).json({
        success: false,
        message: error.message || 'Error assignant el rol',
      });
    }
  }

  /**
   * Remueve un rol de un usuario
   * DELETE /api/admin/users/:userId/roles/:roleId
   */
  async removeRoleFromUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, roleId } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuari no autenticat',
        });
        return;
      }

      await roleService.removeRoleFromUser(
        userId,
        roleId,
        req.user.userId,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: 'Rol eliminat de l\'usuari correctament',
      });
    } catch (error: any) {
      console.error('Error eliminant rol d\'usuari:', error);
      res.status(error.message.includes('permisos') ? 403 : 500).json({
        success: false,
        message: error.message || 'Error eliminant el rol de l\'usuari',
      });
    }
  }

  /**
   * Obtiene los logs de auditoría de un rol
   * GET /api/admin/roles/:id/audit
   */
  async getRoleAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { page, limit, startDate, endDate } = req.query;

      const result = await auditService.getRoleLogs(id, {
        limit: limit ? parseInt(limit as string) : 50,
        skip: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 50) : 0,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
        },
      });
    } catch (error: any) {
      console.error('Error obtenint logs d\'auditoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint els logs d\'auditoria',
        error: error.message,
      });
    }
  }
}

export default new RolesController();
