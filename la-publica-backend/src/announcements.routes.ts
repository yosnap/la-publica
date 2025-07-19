import express from 'express';
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';
import {
  createAnnouncement,
  listAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
  showInterest,
  getPopularCategories
} from './announcements.controller';

const router = express.Router();

// Rutas públicas
router.get('/', listAnnouncements);
router.get('/categories/popular', getPopularCategories);
router.get('/:id', getAnnouncementById);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Rutas para usuarios (solo usuarios normales pueden crear anuncios)
router.post('/', authorize(['user']), createAnnouncement);
router.get('/my/announcements', authorize(['user']), getMyAnnouncements);
router.put('/:id', authorize(['user']), updateAnnouncement);
router.delete('/:id', authorize(['user']), deleteAnnouncement);
router.post('/:id/interest', authorize(['user']), showInterest);

export default router;