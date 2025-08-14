import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ImageProcessingOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Configuraciones predefinidas para diferentes tipos de imágenes
 * Optimizadas para performance web y casos de uso específicos
 */
export const ImageConfigs = {
  // Fotos de perfil - alta calidad para avatares nítidos
  profile: {
    quality: 85,
    width: 400,
    height: 400,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  
  // Imágenes de portada - panorámicas optimizadas
  cover: {
    quality: 80,
    width: 1200,
    height: 400,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  
  // Posts/contenido - balance calidad/tamaño
  post: {
    quality: 80,
    width: 1920,
    height: 1080,
    format: 'webp' as const,
    fit: 'inside' as const
  },
  
  // Logos empresariales - alta calidad para detalles
  logo: {
    quality: 90,
    width: 500,
    height: 500,
    format: 'webp' as const,
    fit: 'inside' as const
  },
  
  // Thumbnails - pequeños y optimizados
  thumbnail: {
    quality: 70,
    width: 300,
    height: 300,
    format: 'webp' as const,
    fit: 'cover' as const
  }
};

/**
 * Procesa una imagen aplicando optimizaciones WebP
 */
export const processImage = async (
  inputPath: string,
  outputPath: string,
  options: ImageProcessingOptions = {}
): Promise<{ success: boolean; outputPath?: string; error?: string }> => {
  try {
    const {
      quality = 80,
      width,
      height,
      format = 'webp',
      fit = 'inside'
    } = options;

    // Crear el directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let sharpInstance = sharp(inputPath);

    // Aplicar redimensionamiento si se especifica
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, { fit });
    }

    // Convertir a WebP con calidad especificada
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    }

    // Guardar la imagen procesada
    await sharpInstance.toFile(outputPath);

    return { success: true, outputPath };
  } catch (error) {
    console.error('Error processing image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Procesa imagen según tipo predefinido
 */
export const processImageByType = async (
  inputPath: string,
  outputDir: string,
  imageType: keyof typeof ImageConfigs,
  filename?: string
): Promise<{ success: boolean; outputPath?: string; publicUrl?: string; error?: string }> => {
  try {
    const config = ImageConfigs[imageType];
    
    // Generar nombre de archivo si no se proporciona
    const baseName = filename || `${imageType}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const outputFilename = `${baseName}.webp`;
    const outputPath = path.join(outputDir, outputFilename);
    
    const result = await processImage(inputPath, outputPath, config);
    
    if (result.success) {
      // Generar URL pública
      const publicUrl = path.join('/uploads/images', outputFilename).replace(/\\/g, '/');
      
      return {
        success: true,
        outputPath: result.outputPath,
        publicUrl
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error processing image by type:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Obtiene información de una imagen
 */
export const getImageInfo = async (imagePath: string) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      success: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density
      }
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Valida si un archivo es una imagen válida
 */
export const isValidImage = async (filePath: string): Promise<boolean> => {
  try {
    await sharp(filePath).metadata();
    return true;
  } catch {
    return false;
  }
};

/**
 * Cleanup: elimina archivo temporal
 */
export const cleanupTempFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};