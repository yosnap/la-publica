import { Router } from 'express';
import {
  createGroupPost,
  getGroupPosts,
  getGroupPostById,
  updateGroupPost,
  deleteGroupPost,
  toggleLikeGroupPost,
  addCommentToGroupPost,
  deleteCommentFromGroupPost,
  togglePinGroupPost,
  toggleCommentsGroupPost
} from './groupPost.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// --- Rutas de Posts ---
// Crear post en un grupo
router.post('/:groupId/posts', createGroupPost);

// Obtener posts de un grupo
router.get('/:groupId/posts', getGroupPosts);

// Obtener un post específico
router.get('/:groupId/posts/:postId', getGroupPostById);

// Actualizar un post
router.put('/:groupId/posts/:postId', updateGroupPost);

// Eliminar un post
router.delete('/:groupId/posts/:postId', deleteGroupPost);

// --- Rutas de Interacciones ---
// Like/Unlike post
router.post('/:groupId/posts/:postId/like', toggleLikeGroupPost);

// --- Rutas de Comentarios ---
// Agregar comentario
router.post('/:groupId/posts/:postId/comments', addCommentToGroupPost);

// Eliminar comentario
router.delete('/:groupId/posts/:postId/comments/:commentId', deleteCommentFromGroupPost);

// --- Rutas de Moderación ---
// Fijar/Desfijar post (solo admin/moderador)
router.patch('/:groupId/posts/:postId/pin', togglePinGroupPost);

// Habilitar/Deshabilitar comentarios (solo admin/moderador)
router.patch('/:groupId/posts/:postId/comments/toggle', toggleCommentsGroupPost);

export default router;