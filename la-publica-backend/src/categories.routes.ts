import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  createCategory,
  listCategories,
  getCategoriesTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryStats
} from './categories.controller';

const router = express.Router();

// Rutas públicas
router.get('/', listCategories);
router.get('/tree', getCategoriesTree);
router.get('/stats', getCategoryStats);
router.get('/:id', getCategoryById);

// Rutas protegidas - requieren autenticación y permisos de admin
router.use(authenticate);
router.use(authorize(['admin']));

// Rutas para administradores
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.put('/reorder/bulk', reorderCategories);

export default router;