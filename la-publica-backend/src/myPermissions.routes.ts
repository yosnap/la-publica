import express from 'express';
import permissionsController from './controllers/permissions.controller';
import { authenticate as auth } from './middleware/auth';

const router = express.Router();

/**
 * Rutas públicas de permisos (para usuarios autenticados)
 * Base: /api/auth/permissions
 *
 * Permiten a los usuarios consultar sus propios permisos
 */

// Obtener mis permisos
router.get(
  '/my-permissions',
  auth,
  permissionsController.getMyPermissions
);

// Verificar si tengo un permiso específico
router.post(
  '/check-permission',
  auth,
  permissionsController.checkPermission
);

export default router;
