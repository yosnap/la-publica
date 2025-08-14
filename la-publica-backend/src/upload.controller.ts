import { Request, Response } from 'express';
import path from 'path';
import { processImageByType, cleanupTempFile, ImageConfigs } from './utils/imageProcessor';

// Función genérica para subir imágenes con tipo específico
const uploadImageWithType = async (req: Request, res: Response, imageType: keyof typeof ImageConfigs) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }

  try {
    // Directorio de imágenes procesadas
    const outputDir = path.join(__dirname, '../uploads/images');
    
    // Procesar la imagen subida
    const result = await processImageByType(
      req.file.path,
      outputDir,
      imageType
    );
    
    // Limpiar archivo temporal original
    cleanupTempFile(req.file.path);
    
    if (!result.success) {
      return res.status(500).json({ 
        message: 'Error al procesar la imagen.',
        error: result.error
      });
    }
    
    return res.status(201).json({ 
      message: `Imagen de ${imageType} subida y optimizada correctamente.`,
      imageUrl: result.publicUrl,
      originalSize: req.file.size,
      processedFormat: 'webp',
      imageType
    });
    
  } catch (error) {
    // Limpiar archivo temporal en caso de error
    if (req.file?.path) {
      cleanupTempFile(req.file.path);
    }
    
    console.error(`Error en upload ${imageType}:`, error);
    return res.status(500).json({ 
      message: 'Error interno del servidor al procesar la imagen.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Endpoint genérico (por compatibilidad)
export const uploadImage = async (req: Request, res: Response) => {
  const imageType = (req.body.imageType as keyof typeof ImageConfigs) || 'post';
  return uploadImageWithType(req, res, imageType);
};

// Endpoints específicos por tipo de imagen
export const uploadProfileImage = async (req: Request, res: Response) => {
  return uploadImageWithType(req, res, 'profile');
};

export const uploadCoverImage = async (req: Request, res: Response) => {
  return uploadImageWithType(req, res, 'cover');
};

export const uploadPostImage = async (req: Request, res: Response) => {
  return uploadImageWithType(req, res, 'post');
};

export const uploadLogoImage = async (req: Request, res: Response) => {
  return uploadImageWithType(req, res, 'logo');
};

export const uploadThumbnailImage = async (req: Request, res: Response) => {
  return uploadImageWithType(req, res, 'thumbnail');
};

// Endpoint para obtener información sobre tipos de imagen disponibles
export const getImageTypesInfo = (req: Request, res: Response) => {
  const typesInfo = Object.entries(ImageConfigs).map(([type, config]) => ({
    type,
    ...config,
    description: getImageTypeDescription(type as keyof typeof ImageConfigs)
  }));

  return res.status(200).json({
    message: 'Tipos de imagen disponibles y sus configuraciones.',
    types: typesInfo,
    totalTypes: typesInfo.length
  });
};

// Función auxiliar para obtener descripciones de tipos
const getImageTypeDescription = (type: keyof typeof ImageConfigs): string => {
  const descriptions = {
    profile: 'Fotos de perfil de usuario - alta calidad para avatares nítidos',
    cover: 'Imágenes de portada - panorámicas optimizadas para carga rápida',
    post: 'Imágenes de contenido social - balance entre calidad y tamaño',
    logo: 'Logos empresariales - alta calidad para mantener detalles corporativos',
    thumbnail: 'Miniaturas - pequeñas y optimizadas para listados y previews'
  };
  return descriptions[type];
}; 