import { Router } from 'express';
import {
  listUsers,
  getUserById,
  getUserBySlug,
  updateProfile,
  deleteUser,
  followOrUnfollowUser,
  getFollowers,
  getFollowing,
  getProfile,
  checkToken
} from './users.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = Router();

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', authenticate, getProfile);

// Debug endpoint para verificar token (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.get('/check-token', authenticate, checkToken);
}

// Listar usuarios
router.get('/', listUsers);
// Ver usuario por slug
router.get('/slug/:slug', getUserBySlug);
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