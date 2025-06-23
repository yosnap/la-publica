import axios from 'axios';

// La URL base de nuestra API del backend
// En desarrollo, apunta a localhost. En producción, apuntará al dominio real.
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : 'https://tu-dominio-de-produccion.com/api'; // TODO: Actualizar en producción

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
 * Interceptor para añadir el token JWT a las cabeceras de todas las peticiones
 * que salgan de nuestra aplicación, si es que existe.
 */
apiClient.interceptors.request.use(
  (config) => {
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