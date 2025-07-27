import { Router } from 'express';
import {
  checkInstallationStatus,
  installSystem,
  protectInstallRoute
} from './install.controller';

const router = Router();

/**
 * @route GET /api/install/status
 * @desc Verificar el estado de instalación del sistema
 * @access Public (siempre disponible para verificar estado)
 */
router.get('/status', checkInstallationStatus);

/**
 * @route POST /api/install
 * @desc Instalar el sistema (crear admin y configuración inicial)
 * @access Public (solo si no está instalado)
 * @body {
 *   email?: string,
 *   password?: string,
 *   firstName?: string,
 *   lastName?: string,
 *   username?: string
 * }
 *
 * Ejemplo de uso:
 * POST /api/install
 * {
 *   "email": "admin@lapublica.cat",
 *   "password": "MiPasswordSegura123!",
 *   "firstName": "Admin",
 *   "lastName": "Principal"
 * }
 */
router.post('/', protectInstallRoute, installSystem);

export default router;
