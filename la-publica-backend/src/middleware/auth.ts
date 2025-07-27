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
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`🚫 [${timestamp}] Auth failed - No token provided. IP: ${ip}, UA: ${userAgent}, Path: ${req.path}`);
    res.status(401).json({
      success: false,
      message: 'Es requereix un token d\'autenticació vàlid.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JWTService.verifyToken(token);
    
    // Log successful authentication in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log(`✅ [${timestamp}] Auth success - User: ${decoded.email}, Role: ${decoded.role}, IP: ${ip}, Path: ${req.path}`);
    }
    
    req.user = decoded; // Adjuntar payload decodificado a la request
    next();
  } catch (error: any) {
    // Detailed logging for authentication failures
    const tokenPreview = token.length > 20 ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : token;
    
    console.error(`❌ [${timestamp}] Auth failed - Error: ${error.message}`);
    console.error(`   Token preview: ${tokenPreview}`);
    console.error(`   IP: ${ip}, UA: ${userAgent}`);
    console.error(`   Path: ${req.path}`);
    
    // Try to decode token without verification to get expiration info
    try {
      const decodedWithoutVerify = JWTService.decodeToken(token);
      if (decodedWithoutVerify?.exp) {
        const expDate = new Date(decodedWithoutVerify.exp * 1000);
        const now = new Date();
        const timeDiff = expDate.getTime() - now.getTime();
        console.error(`   Token exp: ${expDate.toISOString()}, Current: ${now.toISOString()}, Diff: ${timeDiff}ms`);
        console.error(`   User from token: ${decodedWithoutVerify.email}`);
      }
    } catch (decodeError) {
      console.error(`   Could not decode token: ${decodeError}`);
    }
    
    res.status(401).json({
      success: false,
      message: error.message || 'Token invàlid o caducat.'
    });
  }
};