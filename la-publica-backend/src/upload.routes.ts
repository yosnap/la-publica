import { Router } from 'express';
import { 
  uploadImage, 
  uploadProfileImage, 
  uploadCoverImage, 
  uploadPostImage, 
  uploadLogoImage, 
  uploadThumbnailImage,
  getImageTypesInfo
} from './upload.controller';
import upload from './config/cloudinary';
import { authenticate } from './middleware/auth';
import { detectImageType, validateImageType } from './middleware/imageTypeDetector';

const router = Router();

// Endpoint genérico (por compatibilidad) - con detección automática de tipo
router.post('/image', authenticate, upload.single('image'), detectImageType, validateImageType, uploadImage);

// Endpoints específicos por tipo de imagen
router.post('/profile', authenticate, upload.single('image'), uploadProfileImage);
router.post('/cover', authenticate, upload.single('image'), uploadCoverImage);
router.post('/post', authenticate, upload.single('image'), uploadPostImage);
router.post('/logo', authenticate, upload.single('image'), uploadLogoImage);
router.post('/thumbnail', authenticate, upload.single('image'), uploadThumbnailImage);

// Endpoint informativo
router.get('/types', getImageTypesInfo);

export default router; 