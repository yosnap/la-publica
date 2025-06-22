import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../utils/helpers';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string | number;
  path?: string;
  value?: any;
  errors?: any;
  keyValue?: any;
  type?: string;
}

// Middleware de manejo de errores global
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('🔥 Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de cast de MongoDB (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = { name: 'CastError', message, status: 404 } as CustomError;
  }

  // Error de duplicado de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `${field || 'Campo'} ya existe`;
    error = { name: 'DuplicateField', message, status: 400 } as CustomError;
  }

  // Error de validación de MongoDB
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = { name: 'ValidationError', message, status: 400 } as CustomError;
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { name: 'JsonWebTokenError', message, status: 401 } as CustomError;
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { name: 'TokenExpiredError', message, status: 401 } as CustomError;
  }

  // Error de Multer (archivos)
  if (err.name === 'MulterError') {
    let message = 'Error al subir archivo';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'El archivo es demasiado grande';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo de archivo inesperado';
        break;
    }

    error = { name: 'FileUploadError', message, status: 400 } as CustomError;
  }

  // Error de Stripe
  if (err.type && err.type.includes('Stripe')) {
    const message = 'Error en el procesamiento del pago';
    error = { name: 'PaymentError', message, status: 400 } as CustomError;
  }

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(status).json(
    ResponseService.error(
      message,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
};

// Middleware para rutas no encontradas
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`) as CustomError;
  error.status = 404;
  next(error);
};

// Wrapper para async/await
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Crear error personalizado
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error = new Error(message) as CustomError;
  error.status = statusCode;
  return error;
};

// Validar variables de entorno
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missingEnvVars.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    process.exit(1);
  }

  console.log('✅ Variables de entorno validadas');
};
