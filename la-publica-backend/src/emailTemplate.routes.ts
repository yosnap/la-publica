import express from 'express';
import * as emailTemplateController from './emailTemplate.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(authorize(['admin', 'superadmin']));

// CRUD de plantillas
router.get('/', emailTemplateController.getEmailTemplates);
router.get('/:id', emailTemplateController.getEmailTemplate);
router.post('/', emailTemplateController.createEmailTemplate);
router.put('/:id', emailTemplateController.updateEmailTemplate);
router.delete('/:id', emailTemplateController.deleteEmailTemplate);

// Vista previa y testing
router.post('/:id/preview', emailTemplateController.previewEmailTemplate);
router.post('/:id/send-test', emailTemplateController.sendTestEmail);

export default router;
