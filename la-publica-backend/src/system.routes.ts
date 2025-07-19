import { Router } from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  getSystemInfo,
  getLogs,
  getLogById,
  deleteLogs,
  updateSystemVersion
} from './system.controller';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(authorize(['admin']));

// Información del sistema
router.get('/info', getSystemInfo);
router.put('/version', updateSystemVersion);

// Logs del sistema
router.get('/logs', getLogs);
router.get('/logs/:id', getLogById);
router.delete('/logs', deleteLogs);

export default router;