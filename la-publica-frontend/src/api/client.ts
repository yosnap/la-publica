import axios from 'axios';

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

export default apiClient; 