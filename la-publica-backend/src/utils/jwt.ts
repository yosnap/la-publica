import jwt, { Secret } from 'jsonwebtoken';
import { JWTPayload } from '../types';

// JWT_EXPIRES_IN en segundos (por defecto 7 días)
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '604800', 10);

export class JWTService {
  /**
   * Obtiene el secreto de forma segura desde las variables de entorno.
   * Lanza un error si no está definido en un entorno de producción.
   */
  private static getSecret(): Secret {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET no está definido en las variables de entorno.');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      // Usar un secreto de fallback solo para desarrollo para evitar crashes
      return 'fallback-secret-for-dev-only';
    }
    return secret;
  }

  // Generar token de acceso
  static generateAccessToken(payload: { userId: string; email: string; role: 'user' | 'admin' }): string {
    const plainPayload = { ...payload };
    return jwt.sign(plainPayload, this.getSecret(), {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'la-publica-api',
      audience: 'la-publica-users'
    });
  }

  // Verificar token
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecret(), {
        issuer: 'la-publica-api'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw new Error('Error verificando token');
    }
  }

  // Decodificar sin verificar
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  // Verificar si token expira pronto
  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 60): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const thresholdTime = thresholdMinutes * 60 * 1000;

      return (expirationTime - currentTime) <= thresholdTime;
    } catch {
      return true;
    }
  }
}
