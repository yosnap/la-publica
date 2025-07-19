import apiClient from './client';

// Obtener todos los anuncios (con filtros opcionales)
export const getAllAnnouncements = async (params?: {
  type?: 'offer' | 'demand';
  category?: string;
  active?: boolean;
  featured?: boolean;
  author?: string;
}) => {
  const response = await apiClient.get('/api/announcements', { params });
  return response.data;
};

// Obtener un anuncio por ID
export const getAnnouncementById = async (id: string) => {
  const response = await apiClient.get(`/api/announcements/${id}`);
  return response.data;
};

// Crear un nuevo anuncio
export const createAnnouncement = async (data: {
  type: 'offer' | 'demand';
  title: string;
  description: string;
  category?: string;
  price?: number;
  budget?: {
    min: number;
    max: number;
  };
  location?: string | {
    city: string;
    country: string;
    allowRemote?: boolean;
  };
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}) => {
  const response = await apiClient.post('/api/announcements', data);
  return response.data;
};

// Actualizar un anuncio
export const updateAnnouncement = async (id: string, data: any) => {
  const response = await apiClient.put(`/api/announcements/${id}`, data);
  return response.data;
};

// Eliminar un anuncio (solo el autor o admin)
export const deleteAnnouncement = async (id: string) => {
  const response = await apiClient.delete(`/api/announcements/${id}`);
  return response.data;
};

// Obtener anuncios de un usuario específico
export const getUserAnnouncements = async (userId?: string) => {
  const params = userId ? { author: userId } : {};
  const response = await apiClient.get('/api/announcements', { params });
  return response.data;
};