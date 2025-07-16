import { Router } from 'express';
import { 
  exportConfiguration, 
  importConfiguration, 
  validateConfiguration 
} from './backup.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Aplicar middleware de autorización - solo admin
router.use(authorize(['admin']));

// Exportar configuración de la plataforma
router.get('/export', exportConfiguration);

// Importar configuración de la plataforma
router.post('/import', importConfiguration);

// Validar archivo de configuración
router.post('/validate', validateConfiguration);

export default router;