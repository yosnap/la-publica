import jwt, { Secret } from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback-secret';
// JWT_EXPIRES_IN en segundos (por defecto 7 días)
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '604800', 10);

export class JWTService {
  // Generar token de acceso
  static generateAccessToken(payload: { userId: string; email: string; role: 'user' | 'admin' }): string {
    const plainPayload = { ...payload };
    console.log('Secreto usado para firmar:', JWT_SECRET);
    return jwt.sign(plainPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'la-publica-api',
      audience: 'la-publica-users'
    });
  }

  // Verificar token
  static verifyToken(token: string): JWTPayload {
    try {
      console.log('Secreto usado para verificar:', JWT_SECRET);
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'la-publica-api'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw { status: 401, message: 'Token expirado' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw { status: 401, message: 'Token inválido' };
      }
      throw { status: 500, message: 'Error verificando token' };
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
