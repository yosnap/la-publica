import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  createJobOffer,
  listJobOffers,
  getJobOfferById,
  updateJobOffer,
  deleteJobOffer,
  getMyJobOffers,
  getJobOffersByCompany
} from './jobOffers.controller';

const router = express.Router();

// Rutas públicas para colaboradores (gestión)
router.get('/company/:companyId', getJobOffersByCompany);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para usuarios (ver ofertas)
router.get('/', authorize(['user']), listJobOffers);
router.get('/:id', authorize(['user']), getJobOfferById);

// Rutas para colaboradores
router.post('/', authorize(['colaborador']), createJobOffer);
router.get('/my/offers', getMyJobOffers);
router.put('/:id', updateJobOffer);
router.delete('/:id', deleteJobOffer);

export default router;