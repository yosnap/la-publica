import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  createAdvisory,
  listAdvisories,
  getAdvisoryById,
  updateAdvisory,
  deleteAdvisory,
  getMyAdvisories,
  getAdvisoriesByCompany,
  addReview,
  getPopularCategories
} from './advisories.controller';

const router = express.Router();

// Rutas públicas para usuarios (ver asesorías)
router.get('/', listAdvisories);
router.get('/categories/popular', getPopularCategories);
router.get('/:id', getAdvisoryById);
router.get('/company/:companyId', getAdvisoriesByCompany);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para usuarios (agregar reseñas)
router.post('/:id/reviews', authorize(['user']), addReview);

// Rutas para colaboradores (gestión de asesorías)
router.post('/', authorize(['colaborador']), createAdvisory);
router.get('/my/advisories', authorize(['colaborador']), getMyAdvisories);
router.put('/:id', authorize(['colaborador']), updateAdvisory);
router.delete('/:id', authorize(['colaborador']), deleteAdvisory);

export default router;