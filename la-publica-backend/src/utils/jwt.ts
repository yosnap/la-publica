import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';

// JWT_EXPIRES_IN - manejar tanto string como número
const getExpiresIn = (): string | number => {
  const envValue = process.env.JWT_EXPIRES_IN || '7d';
  // Si es un número (en segundos), convertir a número
  if (/^\d+$/.test(envValue)) {
    return parseInt(envValue, 10);
  }
  // Si es un string como "7d", mantener como string
  return envValue;
};

const JWT_EXPIRES_IN = getExpiresIn();

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
  static generateAccessToken(payload: { userId: string; email: string; role: 'user' | 'admin' | 'colaborador' | 'editor' }): string {
    const plainPayload = { ...payload };
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as any,
      issuer: 'la-publica-api',
      audience: 'la-publica-users'
    };
    const token = jwt.sign(plainPayload, this.getSecret(), options);
    
    // Debug logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Calcular fecha de expiración basada en el token generado
      const decoded = jwt.decode(token) as any;
      const expirationDate = decoded?.exp ? new Date(decoded.exp * 1000) : null;
      console.log(`🔑 Token generado para ${payload.email}, expira: ${expirationDate?.toLocaleString() || 'fecha desconocida'} (duración: ${JWT_EXPIRES_IN})`);
    }
    
    return token;
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
        // Debug logging en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚠️ Token expirado detectado: ${error.message}`);
          const decoded = jwt.decode(token) as any;
          if (decoded?.exp) {
            const expiredAt = new Date(decoded.exp * 1000);
            console.log(`   Expiró en: ${expiredAt.toLocaleString()}`);
            console.log(`   Tiempo actual: ${new Date().toLocaleString()}`);
          }
        }
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚠️ Token inválido: ${error.message}`);
        }
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
