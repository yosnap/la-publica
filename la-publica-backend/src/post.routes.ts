import { Router } from 'express';
import { createPost, listPosts, getPostById, updatePost, deletePost, likePost, commentOnPost, getUserFeed, toggleComments, togglePinPost } from './post.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// --- Rutas Públicas ---
// Listar todos los posts
router.get('/', listPosts);

// Ver un post específico
router.get('/:id', getPostById);

// --- Rutas Protegidas ---
// Crear un nuevo post
router.post('/', authenticate, createPost);

// Editar un post
router.put('/:id', authenticate, updatePost);

// Eliminar un post
router.delete('/:id', authenticate, deletePost);

// Dar/quitar like a un post
router.post('/:id/like', authenticate, likePost);

// Comentar un post
router.post('/:id/comment', authenticate, commentOnPost);

// Obtener el feed personal
router.get('/feed/me', authenticate, getUserFeed);

// Desactivar/activar comentarios (admin/moderador)
router.patch('/:id/toggle-comments', authenticate, toggleComments);

// Fijar/desfijar post en el feed (admin/moderador)
router.patch('/:id/toggle-pin', authenticate, togglePinPost);

export default router; 