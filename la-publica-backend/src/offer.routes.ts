import { Router } from 'express';
import {
  createOffer,
  getOffers,
  getOfferBySlug,
  updateOffer,
  deleteOffer,
  togglePauseOffer,
  createCoupon,
  validateCoupon,
  deactivateCoupon,
  getMyOffers
} from './offer.controller';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

const router = Router();

// Rutas públicas
router.get('/', getOffers); // Listar ofertas

// Rutas para colaboradores y admin (ANTES de las rutas con parámetros)
router.get(
  '/my-offers',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  getMyOffers
); // Mis ofertas

router.post(
  '/',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  createOffer
); // Crear oferta

// Rutas públicas con parámetros (DESPUÉS de las rutas específicas)
router.get('/:slug', getOfferBySlug); // Obtener oferta por slug

// Rutas protegidas (autenticado)
router.post('/:id/coupons/validate', authenticate, validateCoupon); // Validar cupón

router.put(
  '/:id',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  updateOffer
); // Actualizar oferta

router.delete(
  '/:id',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  deleteOffer
); // Eliminar oferta

router.patch(
  '/:id/toggle-pause',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  togglePauseOffer
); // Pausar/Reanudar oferta

router.post(
  '/:id/coupons',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  createCoupon
); // Crear cupón

router.patch(
  '/:id/coupons/:code/deactivate',
  authenticate,
  authorize(['colaborador', 'admin', 'superadmin']),
  deactivateCoupon
); // Desactivar cupón

export default router;
