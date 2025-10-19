import apiClient from './client';

// Interfaces para las categorías
export interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: 'company' | 'job' | 'announcement' | 'advisory' | 'promotional_offer';
  parentCategory?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: 'company' | 'job' | 'announcement' | 'advisory' | 'promotional_offer';
  parentCategory?: string;
  order?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export interface CategoryStats {
  _id: string;
  total: number;
  active: number;
  inactive: number;
}

// API functions
export const getCategories = async (params?: {
  type?: string;
  includeInactive?: boolean;
  parentCategory?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.includeInactive) queryParams.append('includeInactive', 'true');
  if (params?.parentCategory !== undefined) queryParams.append('parentCategory', params.parentCategory);
  
  const response = await apiClient.get(`/categories?${queryParams.toString()}`);
  return response.data;
};

export const getCategoriesTree = async (type: string) => {
  const response = await apiClient.get(`/categories/tree?type=${type}`);
  return response.data;
};

export const getCategoryStats = async (type?: string) => {
  const queryParams = type ? `?type=${type}` : '';
  const response = await apiClient.get(`/categories/stats${queryParams}`);
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: CreateCategoryData) => {
  const response = await apiClient.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

export const reorderCategories = async (categories: { id: string; order: number }[]) => {
  const response = await apiClient.put('/categories/reorder/bulk', { categories });
  return response.data;
};