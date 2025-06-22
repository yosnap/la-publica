import { Router } from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  listAllUsers,
  updateUserByAdmin,
  deletePostByAdmin
} from './admin.controller';

const router = Router();

// Todas las rutas aquí están protegidas y requieren rol de admin.
// El middleware se aplicará a todas las rutas definidas en este archivo.
router.use(authenticate, authorize(['admin']));

// --- Rutas de Gestión de Usuarios ---
router.get('/users', listAllUsers);
router.put('/users/:id', updateUserByAdmin);

// --- Rutas de Gestión de Posts ---
router.delete('/posts/:id', deletePostByAdmin);

export default router; 