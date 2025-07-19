import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware para autorizar el acceso basado en roles de usuario.
 * @param allowedRoles Un array de roles que tienen permiso para acceder a la ruta.
 */
export const authorize = (allowedRoles: Array<'user' | 'admin' | 'colaborador' | 'editor'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticació requerida per a aquesta acció.'
      });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'No tens permisos suficients per realitzar aquesta acció.'
      });
      return;
    }

    next();
  };
}; 