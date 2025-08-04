import { Router } from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  getAllUsers,
  createUser,
  updateUser,
  changePassword,
  changeRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
} from './superadmin.controller';

const router = Router();

// Todas las rutas requieren autenticación y rol superadmin o admin
router.use(authenticate);
router.use(authorize(['superadmin', 'admin']));

// Rutas para gestión de usuarios
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/stats', getUserStats);
router.put('/users/:id', updateUser);
router.put('/users/:id/password', changePassword);
router.put('/users/:id/role', changeRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;