import express from 'express';
import permissionsController from './controllers/permissions.controller';
import { authenticate as auth } from './middleware/auth';
import { checkPermission } from './middleware/rbac';

const router = express.Router();

/**
 * Rutas de gestión de permisos
 * Base: /api/admin/permissions
 *
 * Todas las rutas requieren autenticación
 */

// Obtener todos los permisos disponibles
router.get(
  '/',
  auth,
  checkPermission('permissions', 'read'),
  permissionsController.getAllPermissions
);

// Obtener permisos agrupados por resourceGroup
router.get(
  '/grouped',
  auth,
  checkPermission('permissions', 'read'),
  permissionsController.getGroupedPermissions
);

// Obtener permisos de un usuario específico
router.get(
  '/user/:userId',
  auth,
  checkPermission('permissions', 'read'),
  permissionsController.getUserPermissions
);

// Actualizar role overrides de un usuario
router.put(
  '/user/:userId/overrides',
  auth,
  checkPermission('permissions', 'update'),
  permissionsController.updateUserRoleOverrides
);

// Invalidar cache de permisos de un usuario
router.post(
  '/invalidate-cache/:userId',
  auth,
  checkPermission('permissions', 'update'),
  permissionsController.invalidateUserCache
);

// Invalidar todo el cache de permisos
router.post(
  '/invalidate-all-cache',
  auth,
  checkPermission('permissions', 'update'),
  permissionsController.invalidateAllCache
);

export default router;
