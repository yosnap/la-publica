import { Router, Response } from 'express';
import { AuthenticatedRequest } from './types';
import { JWTService } from './utils/jwt';

const router = Router();

/**
 * GET /api/debug/token-info
 * Endpoint para debugging - devuelve información sobre el token actual
 * Solo disponible en desarrollo
 */
router.get('/token-info', (req: AuthenticatedRequest, res: Response) => {
  // Solo disponible en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Endpoint no disponible en producción'
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        success: true,
        data: {
          hasAuthHeader: false,
          message: 'No hay header de autorización'
        }
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = JWTService.verifyToken(token);
      const tokenParts = token.split('.');
      const header = JSON.parse(atob(tokenParts[0]));
      const payload = JSON.parse(atob(tokenParts[1]));

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      const timeToExpiry = payload.exp - currentTime;

      return res.json({
        success: true,
        data: {
          hasAuthHeader: true,
          tokenValid: true,
          isExpired,
          timeToExpiry,
          timeToExpiryFormatted: formatTimeToExpiry(timeToExpiry),
          header,
          payload: {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            iat: payload.iat,
            exp: payload.exp,
            iss: payload.iss,
            aud: payload.aud,
            issuedAt: new Date(payload.iat * 1000).toISOString(),
            expiresAt: new Date(payload.exp * 1000).toISOString()
          },
          serverTime: new Date().toISOString(),
          serverTimestamp: currentTime,
          jwtExpiresIn: process.env.JWT_EXPIRES_IN || '604800'
        }
      });

    } catch (verifyError) {
      // Token inválido pero podemos intentar decodificarlo
      try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));

        return res.json({
          success: true,
          data: {
            hasAuthHeader: true,
            tokenValid: false,
            error: verifyError instanceof Error ? verifyError.message : 'Token inválido',
            payload: {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
              iat: payload.iat,
              exp: payload.exp,
              issuedAt: new Date(payload.iat * 1000).toISOString(),
              expiresAt: new Date(payload.exp * 1000).toISOString()
            },
            serverTime: new Date().toISOString(),
            serverTimestamp: Math.floor(Date.now() / 1000)
          }
        });
      } catch (decodeError) {
        return res.json({
          success: true,
          data: {
            hasAuthHeader: true,
            tokenValid: false,
            tokenMalformed: true,
            error: 'No se puede decodificar el token'
          }
        });
      }
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Helper function para formatear tiempo restante
 */
function formatTimeToExpiry(seconds: number): string {
  if (seconds <= 0) return 'Expirado';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default router;
