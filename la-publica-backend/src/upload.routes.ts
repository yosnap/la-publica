import { Router } from 'express';
import { uploadImage } from './upload.controller';
import upload from './config/cloudinary';
import { authenticate } from './middleware/auth';

const router = Router();

// POST /api/uploads/image
router.post('/image', authenticate, upload.single('image'), uploadImage);

export default router; 