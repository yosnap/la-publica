// Debug service para monitorizar el estado del token JWT

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

interface TokenInfo {
  hasToken: boolean;
  error?: string;
  isExpired?: boolean;
  timeToExpiry?: number;
  timeToExpiryFormatted?: string;
  expiryDate?: string;
  issuedDate?: string;
  userId?: string;
  email?: string;
  role?: string;
  issuer?: string;
  audience?: string;
  raw?: DecodedToken;
}

export class TokenDebugService {

  /**
   * Decodifica un token JWT para obtener su información sin verificarlo
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as DecodedToken;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verifica si un token está expirado
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  /**
   * Obtiene información detallada del token actual
   */
  static getTokenInfo(): TokenInfo {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { hasToken: false, error: 'No hay token en localStorage' };
    }

    const decoded = this.decodeToken(token);
    if (!decoded) {
      return { hasToken: true, error: 'Token no se puede decodificar' };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;
    const timeToExpiry = decoded.exp - currentTime;
    const expiryDate = new Date(decoded.exp * 1000);
    const issuedDate = new Date(decoded.iat * 1000);

    return {
      hasToken: true,
      isExpired,
      timeToExpiry,
      timeToExpiryFormatted: this.formatTimeToExpiry(timeToExpiry),
      expiryDate: expiryDate.toLocaleString(),
      issuedDate: issuedDate.toLocaleString(),
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      issuer: decoded.iss,
      audience: decoded.aud,
      raw: decoded
    };
  }

  /**
   * Formatea el tiempo restante hasta la expiración
   */
  static formatTimeToExpiry(seconds: number): string {
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

  /**
   * Imprime información del token en la consola
   */
  static logTokenInfo(): void {
    const info = this.getTokenInfo();

    console.group('🔐 JWT Token Debug Info');
    console.log('Timestamp:', new Date().toISOString());

    if (!info.hasToken) {
      console.warn('❌ No hay token de autenticación');
    } else if (info.error) {
      console.error('❌ Error:', info.error);
    } else {
      console.log('✅ Token presente y decodificable');
      console.log('📧 Email:', info.email);
      console.log('👤 User ID:', info.userId);
      console.log('🎭 Role:', info.role);
      console.log('📅 Emitido:', info.issuedDate);
      console.log('⏰ Expira:', info.expiryDate);
      console.log(info.isExpired ? '❌ Estado: EXPIRADO' : '✅ Estado: VÁLIDO');
      console.log('⏳ Tiempo restante:', info.timeToExpiryFormatted);
    }

    console.groupEnd();
  }

    /**
   * Inicia un monitor que verifica el token periódicamente
   */
  static startTokenMonitor(intervalMinutes: number = 5): NodeJS.Timeout {
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`🔄 Iniciando monitor de token (cada ${intervalMinutes} minutos)`);

    const monitor = setInterval(() => {
      const info = this.getTokenInfo();

      if (!info.hasToken) {
        console.warn('🚨 Monitor: Token desaparecido del localStorage');
        clearInterval(monitor);
      } else if (info.isExpired) {
        console.warn('🚨 Monitor: Token expirado detectado');
        clearInterval(monitor);
      } else if (info.timeToExpiry && info.timeToExpiry < 300) { // Menos de 5 minutos
        console.warn(`⚠️ Monitor: Token expira pronto (${info.timeToExpiryFormatted})`);
      } else {
        console.log(`✅ Monitor: Token válido (expira en ${info.timeToExpiryFormatted})`);
      }
    }, intervalMs);

    // Verificación inicial
    this.logTokenInfo();

    return monitor;
  }

  /**
   * Verifica si el token está cerca de expirar
   */
  static isTokenNearExpiry(minutesThreshold: number = 30): boolean {
    const info = this.getTokenInfo();
    if (!info.hasToken || info.isExpired) return false;

    return info.timeToExpiry < (minutesThreshold * 60);
  }
}

// Hacer disponible globalmente para debugging en consola
if (typeof window !== 'undefined') {
  (window as typeof window & { TokenDebug: typeof TokenDebugService }).TokenDebug = TokenDebugService;
}

export default TokenDebugService;
