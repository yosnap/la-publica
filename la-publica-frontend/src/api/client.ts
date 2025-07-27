import axios from 'axios';
import TokenDebugService from '@/utils/tokenDebug';

 // La URL base de nuestra API del backend, configurable por entorno
const API_BASE_URL = import.meta.env.VITE_API_URL;

 // Detectar si estamos en producción basado en la URL del API
const isProduction = API_BASE_URL?.includes('lapublica.cat') || import.meta.env.MODE === 'production';

 // Prefijo dinámico: /api en producción, sin prefijo en desarrollo
const API_PREFIX = isProduction ? '/api' : '';

/**
 * Crea una instancia de Axios pre-configurada.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper function para construir URLs con el prefijo correcto
 */
export const buildApiUrl = (endpoint: string): string => {
   // Si el endpoint ya tiene /api, no agregar prefijo
  if (endpoint.startsWith('/api/')) {
    return isProduction ? endpoint : endpoint.replace('/api', '');
  }
   // Si no tiene /api, agregar prefijo solo en producción
  return `${API_PREFIX}${endpoint}`;
};

/**
 * Interceptor para transformar URLs dinámicamente y añadir JWT
 */
apiClient.interceptors.request.use(
  (config) => {
     // Transformar URL dinámicamente
    if (config.url) {
      config.url = buildApiUrl(config.url);
    }

     // Añadir token JWT
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar respuestas, especialmente errores de token expirado
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Logging detallado para debugging de sesiones
    const isProduction = import.meta.env.MODE === 'production';
    const currentTime = new Date().toISOString();
    const currentPath = window.location.pathname;

    if (!isProduction) {
      console.group(`🔍 API Error Debug - ${currentTime}`);
      console.log('Status:', error.response?.status);
      console.log('URL:', error.config?.url);
      console.log('Method:', error.config?.method?.toUpperCase());
      console.log('Current Path:', currentPath);
      console.log('Response Data:', error.response?.data);
      console.log('Auth Token Present:', !!localStorage.getItem('authToken'));
      console.groupEnd();
    }

    // Manejar token expirado
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || error.response?.data?.error || '';

      // Detectar mensaje de token expirado
      if (message.toLowerCase().includes('token expir') ||
          message.toLowerCase().includes('token caducat') ||
          error.response?.data?.error === 'Token expirado' ||
          message.toLowerCase().includes('token invàlid') ||
          message.toLowerCase().includes('token invalid')) {

        // Logging específico para logout automático
        console.warn(`🚪 Logout automático detectado - ${currentTime}`);
        console.warn('Razón:', message);
        console.warn('Path actual:', currentPath);
        console.warn('Token presente antes del logout:', !!localStorage.getItem('authToken'));

        // Limpiar datos de autenticación
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');

        // Mostrar mensaje amigable en catalán
        const userMessage = 'La teva sessió ha expirat. Si us plau, inicia sessió de nou.';

        // Redirigir al login solo si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          console.info('🔄 Redirigiendo al login desde:', currentPath);
          window.location.href = `/login?message=${encodeURIComponent(userMessage)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
