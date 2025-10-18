import express from 'express';
import * as emailConfigController from './emailConfig.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(authorize(['admin', 'superadmin']));

// Configuración global de emails
router.get('/', emailConfigController.getEmailConfig);
router.put('/', emailConfigController.updateEmailConfig);
router.post('/reset', emailConfigController.resetEmailConfig);

export default router;
