import express from 'express';
import rolesController from './controllers/roles.controller';
import { authenticate as auth } from './middleware/auth';
import { checkPermission } from './middleware/rbac';

const router = express.Router();

/**
 * Rutas de gestión de roles
 * Base: /api/admin/roles
 *
 * Todas las rutas requieren autenticación y permisos específicos
 */

// Obtener todos los roles
router.get(
  '/',
  auth,
  checkPermission('roles', 'read'),
  rolesController.getAllRoles
);

// Obtener un rol por ID
router.get(
  '/:id',
  auth,
  checkPermission('roles', 'read'),
  rolesController.getRoleById
);

// Crear un nuevo rol
router.post(
  '/',
  auth,
  checkPermission('roles', 'create'),
  rolesController.createRole
);

// Actualizar un rol
router.put(
  '/:id',
  auth,
  checkPermission('roles', 'update'),
  rolesController.updateRole
);

// Eliminar un rol
router.delete(
  '/:id',
  auth,
  checkPermission('roles', 'delete'),
  rolesController.deleteRole
);

// Clonar un rol
router.post(
  '/:id/clone',
  auth,
  checkPermission('roles', 'create'),
  rolesController.cloneRole
);

// Obtener logs de auditoría de un rol
router.get(
  '/:id/audit',
  auth,
  checkPermission('audit-logs', 'read'),
  rolesController.getRoleAuditLogs
);

// Asignar rol a usuario
router.post(
  '/assign/:userId',
  auth,
  checkPermission('users', 'update'),
  rolesController.assignRoleToUser
);

// Remover rol de usuario
router.delete(
  '/assign/:userId/:roleId',
  auth,
  checkPermission('users', 'update'),
  rolesController.removeRoleFromUser
);

export default router;
