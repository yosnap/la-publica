import { Router } from 'express';
import {
  listUsers,
  getUserById,
  updateProfile,
  deleteUser,
  followOrUnfollowUser,
  getFollowers,
  getFollowing
} from './users.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = Router();

// Listar usuarios
router.get('/', listUsers);
// Ver usuario por ID
router.get('/:id', getUserById);
// Editar perfil (requiere autenticación)
router.put('/profile', authenticate, updateProfile);
// Eliminar usuario por ID
router.delete('/:id', authenticate, authorize(['admin']), deleteUser);

// Seguir / Dejar de seguir a un usuario (protegido)
router.post('/:id/follow', authenticate, followOrUnfollowUser);

// Obtener listas de seguidores y seguidos (públicas)
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router; 