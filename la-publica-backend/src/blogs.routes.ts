import express from 'express';
import {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  getBlogStats,
  getPopularTags
} from './blogs.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = express.Router();

// Rutas públicas
router.get('/blogs', getBlogs);
router.get('/blogs/tags/popular', getPopularTags);
router.get('/blogs/stats', getBlogStats);
router.get('/blogs/:slug', getBlogBySlug);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para usuarios autenticados
router.get('/blogs/my/all', getMyBlogs);

// Ruta protegida para obtener blog por ID (para edición)
router.get('/blogs/edit/:id', authorize(['admin', 'editor']), getBlogById);

// Rutas para admin y editor - solo ellos pueden crear/editar/eliminar blogs
router.post('/blogs', authorize(['admin', 'editor']), createBlog);
router.put('/blogs/:id', authorize(['admin', 'editor']), updateBlog);
router.delete('/blogs/:id', authorize(['admin', 'editor']), deleteBlog);

export default router;