import { Router } from 'express';
import {
  createForum,
  listForums,
  getForumById,
  updateForum,
  addModerator,
  removeModerator,
  deleteForum
} from './forum.controller';
import {
  createForumPost,
  getForumPosts,
  getForumPostById,
  likePost,
  dislikePost,
  reportPost,
  editPost,
  deletePost
} from './forumPost.controller';
import {
  getPendingPosts,
  getReports,
  approvePost,
  rejectPost,
  resolveReport,
  togglePinPost,
  toggleLockPost,
  getModerationStats
} from './moderation.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// === RUTAS DE FOROS ===

// --- Rutas Públicas ---
// Listar foros públicos
router.get('/', listForums);

// Ver un foro específico
router.get('/:id', getForumById);

// Obtener posts de un foro
router.get('/:forumId/posts', getForumPosts);

// --- Rutas Protegidas ---
// Crear un nuevo foro (solo admin)
router.post('/', authenticate, createForum);

// Actualizar foro (creador, moderadores o admin)
router.put('/:id', authenticate, updateForum);

// Agregar moderador (creador o admin)
router.post('/:id/moderators', authenticate, addModerator);

// Remover moderador (creador o admin)
router.delete('/:id/moderators/:moderatorId', authenticate, removeModerator);

// Eliminar foro (solo admin)
router.delete('/:id', authenticate, deleteForum);

// === RUTAS DE POSTS ===

// --- Rutas Públicas ---
// Ver un post específico con respuestas
router.get('/posts/:id', getForumPostById);

// --- Rutas Protegidas ---
// Crear un nuevo post
router.post('/posts', authenticate, createForumPost);

// Dar like a un post
router.post('/posts/:id/like', authenticate, likePost);

// Dar dislike a un post
router.post('/posts/:id/dislike', authenticate, dislikePost);

// Reportar un post
router.post('/posts/:id/report', authenticate, reportPost);

// Editar un post (solo autor)
router.put('/posts/:id', authenticate, editPost);

// Eliminar un post (autor, moderadores o admin)
router.delete('/posts/:id', authenticate, deletePost);

// === RUTAS DE MODERACIÓN (Solo Admin) ===

// Obtener posts pendientes de moderación
router.get('/moderation/pending', authenticate, getPendingPosts);

// Obtener reportes
router.get('/moderation/reports', authenticate, getReports);

// Obtener estadísticas de moderación
router.get('/moderation/stats', authenticate, getModerationStats);

// Aprobar un post
router.post('/moderation/posts/:id/approve', authenticate, approvePost);

// Rechazar un post
router.post('/moderation/posts/:id/reject', authenticate, rejectPost);

// Resolver un reporte
router.post('/moderation/posts/:postId/reports/:reportId/resolve', authenticate, resolveReport);

// Fijar/desfijar un post
router.post('/moderation/posts/:id/toggle-pin', authenticate, togglePinPost);

// Bloquear/desbloquear un post
router.post('/moderation/posts/:id/toggle-lock', authenticate, toggleLockPost);

export default router;