import apiClient from './client';

// Obtener información del sistema
export const getSystemInfo = async () => {
  // Agregar timestamp para evitar cache
  const timestamp = new Date().getTime();
  const response = await apiClient.get(`/api/system/info?t=${timestamp}`);
  return response.data;
};

// Obtener logs del sistema
export const getSystemLogs = async (params?: {
  level?: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/api/system/logs', { params });
  return response.data;
};

// Obtener un log específico
export const getLogById = async (id: string) => {
  const response = await apiClient.get(`/api/system/logs/${id}`);
  return response.data;
};

// Eliminar logs
export const deleteLogs = async (data: {
  ids?: string[];
  olderThan?: string;
}) => {
  const response = await apiClient.delete('/api/system/logs', { data });
  return response.data;
};

// Actualizar versión del sistema
export const updateSystemVersion = async (version: string) => {
  const response = await apiClient.put('/api/system/version', { version });
  return response.data;
};