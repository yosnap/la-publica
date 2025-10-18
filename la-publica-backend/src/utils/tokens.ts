import crypto from 'crypto';

/**
 * Generar token de verificación de email
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generar token de reset de contraseña
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcular fecha de expiración
 */
export function getExpirationDate(hours: number): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}
