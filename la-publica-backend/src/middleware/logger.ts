import { Request, Response, NextFunction } from 'express';
import { createLog } from '../system.controller';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  // Guardar el método original
  const originalSend = res.json;
  const startTime = Date.now();

  // Override del método json para capturar respuestas
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Solo registrar errores y acciones importantes
    if (statusCode >= 400 || req.method !== 'GET') {
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info';
      const userId = (req as any).user?.userId;
      
      createLog(
        level,
        `${req.method} ${req.originalUrl} - ${statusCode}`,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode,
          responseTime: `${responseTime}ms`,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          body: req.method !== 'GET' ? req.body : undefined,
          error: statusCode >= 400 ? data : undefined
        },
        userId
      );
    }
    
    // Llamar al método original
    return originalSend.call(this, data);
  };

  next();
};