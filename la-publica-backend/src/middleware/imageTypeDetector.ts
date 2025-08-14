import { Request, Response, NextFunction } from 'express';
import { ImageConfigs } from '../utils/imageProcessor';

/**
 * Middleware para detectar automáticamente el tipo de imagen
 * basado en headers, query params o contexto de la request
 */
export const detectImageType = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Verificar si se especifica explícitamente en el body
  if (req.body.imageType && req.body.imageType in ImageConfigs) {
    return next();
  }

  // 2. Verificar query parameter
  if (req.query.type && typeof req.query.type === 'string' && req.query.type in ImageConfigs) {
    req.body.imageType = req.query.type;
    return next();
  }

  // 3. Verificar header personalizado
  const headerType = req.get('X-Image-Type');
  if (headerType && headerType in ImageConfigs) {
    req.body.imageType = headerType;
    return next();
  }

  // 4. Detectar basado en la ruta
  const path = req.path;
  if (path.includes('/profile')) {
    req.body.imageType = 'profile';
  } else if (path.includes('/cover')) {
    req.body.imageType = 'cover';
  } else if (path.includes('/post')) {
    req.body.imageType = 'post';
  } else if (path.includes('/logo')) {
    req.body.imageType = 'logo';
  } else if (path.includes('/thumbnail')) {
    req.body.imageType = 'thumbnail';
  } else {
    // 5. Usar 'post' como tipo por defecto
    req.body.imageType = 'post';
  }

  next();
};

/**
 * Middleware para validar el tipo de imagen
 */
export const validateImageType = (req: Request, res: Response, next: NextFunction): void => {
  const imageType = req.body.imageType;
  
  if (!imageType || !(imageType in ImageConfigs)) {
    res.status(400).json({
      message: 'Tipo de imagen no válido.',
      validTypes: Object.keys(ImageConfigs),
      received: imageType
    });
    return;
  }

  next();
};