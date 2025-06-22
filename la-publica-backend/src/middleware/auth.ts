import { Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware para verificar un JSON Web Token (JWT) y adjuntar
 * el payload del usuario al objeto de la solicitud.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Se requiere un token de autenticación válido.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JWTService.verifyToken(token);
    req.user = decoded; // Adjuntar payload decodificado a la request
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado.'
    });
  }
};