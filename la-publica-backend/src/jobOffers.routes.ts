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

// Rutas públicas (ver ofertas)
router.get('/', listJobOffers);
router.get('/:id', getJobOfferById);
router.get('/company/:companyId', getJobOffersByCompany);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para colaboradores (gestión de ofertas)
router.post('/', authorize(['colaborador']), createJobOffer);
router.get('/my/offers', authorize(['colaborador']), getMyJobOffers);
router.put('/:id', authorize(['colaborador']), updateJobOffer);
router.delete('/:id', authorize(['colaborador']), deleteJobOffer);

export default router;