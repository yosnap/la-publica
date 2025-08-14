/**
 * Utilidades para optimización y conversión de imágenes
 * Convierte automáticamente todas las imágenes a WebP para mejor performance
 * 
 * Implementa las siguientes buenas prácticas:
 * - Conversión automática a formato WebP
 * - Redimensionamiento inteligente manteniendo proporción
 * - Optimización de calidad por tipo de imagen
 * - Validación de archivos antes del procesamiento
 * - Configuraciones predefinidas por uso específico
 */

export interface ImageOptimizationOptions {
  quality?: number; // 0.0 - 1.0, default 0.8
  maxWidth?: number; // máximo ancho en pixels
  maxHeight?: number; // máximo alto en pixels
  format?: 'webp' | 'jpeg' | 'png'; // formato de salida, default webp
}

/**
 * Convierte un archivo de imagen a WebP optimizado
 */
export const convertImageToWebP = (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp'
    } = options;

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Configurar canvas con las nuevas dimensiones
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob con el formato especificado
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al convertir imagen'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convierte imagen con cropping a WebP optimizado
 */
export const convertCroppedImageToWebP = (
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const {
      quality = 0.8,
      format = 'webp'
    } = options;

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    img.onload = () => {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al convertir imagen'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = imageSrc;
  });
};

/**
 * Obtiene el nombre de archivo WebP basado en el archivo original
 */
export const getWebPFileName = (originalFile: File): string => {
  const nameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}.webp`;
};

/**
 * Valida si el archivo es una imagen
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Configuraciones predefinidas para diferentes tipos de imágenes
 * Optimizadas según el uso y mejores prácticas de performance web
 */
export const ImageConfigs = {
  // Fotos de perfil - más pequeñas, alta calidad para nitidez en avatares
  profile: {
    quality: 0.85,
    maxWidth: 400,
    maxHeight: 400,
    format: 'webp' as const
  },
  
  // Imágenes de portada - panorámicas, optimizadas para carga rápida
  cover: {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 400,
    format: 'webp' as const
  },
  
  // Posts/contenido - balance entre calidad y tamaño, responsive
  post: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const
  },
  
  // Logos de empresas - alta calidad para mantener detalles corporativos
  logo: {
    quality: 0.9,
    maxWidth: 500,
    maxHeight: 500,
    format: 'webp' as const
  },
  
  // Thumbnails - pequeños, optimizados para listados y previews
  thumbnail: {
    quality: 0.7,
    maxWidth: 300,
    maxHeight: 300,
    format: 'webp' as const
  }
};

/**
 * Función helper para convertir automáticamente según el tipo de imagen
 */
export const convertImageByType = async (
  file: File,
  type: keyof typeof ImageConfigs
): Promise<Blob> => {
  if (!isImageFile(file)) {
    throw new Error('El archivo no es una imagen válida');
  }
  
  return convertImageToWebP(file, ImageConfigs[type]);
};