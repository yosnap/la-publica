import apiClient from './client';

export interface ForumCategory {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Obtener todas las categorías de foros
export const fetchForumCategories = async () => {
  const response = await apiClient.get('/api/forum-categories');
  return response.data;
};

// Obtener una categoría por ID
export const getForumCategoryById = async (id: string) => {
  const response = await apiClient.get(`/api/forum-categories/${id}`);
  return response.data;
};

// Crear una nueva categoría (solo admin)
export const createForumCategory = async (data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) => {
  const response = await apiClient.post('/api/forum-categories', data);
  return response.data;
};

// Actualizar una categoría (solo admin)
export const updateForumCategory = async (id: string, data: Partial<ForumCategory>) => {
  const response = await apiClient.put(`/forum-categories/${id}`, data);
  return response.data;
};

// Eliminar una categoría (solo admin)
export const deleteForumCategory = async (id: string) => {
  const response = await apiClient.delete(`/forum-categories/${id}`);
  return response.data;
};