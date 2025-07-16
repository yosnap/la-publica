import { Router } from 'express';
import {
  createForumCategory,
  listForumCategories,
  getForumCategoryById,
  updateForumCategory,
  deleteForumCategory
} from './forumCategory.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// --- Rutas Públicas ---
// Listar categorías de foros
router.get('/', listForumCategories);

// Ver una categoría específica
router.get('/:id', getForumCategoryById);

// === RUTAS DE CATEGORÍAS (Solo Admin) ===
// Crear categoría
router.post('/', authenticate, createForumCategory);

// Actualizar categoría
router.put('/:id', authenticate, updateForumCategory);

// Eliminar categoría
router.delete('/:id', authenticate, deleteForumCategory);

export default router;