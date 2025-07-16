import apiClient from './client';

// Tipos para grupos
export interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  image?: string;
  coverImage?: string;
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  }>;
  memberCount: number;
  postCount: number;
  tags: string[];
  rules?: string[];
  location?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRole?: 'admin' | 'moderator' | 'member';
}

export interface CreateGroupData {
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  tags: string[];
  rules: string[];
  location?: string;
  website?: string;
  image?: string;
  coverImage?: string;
}

export interface GroupCategory {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

// Crear un nuevo grupo
export const createGroup = async (groupData: CreateGroupData) => {
  const response = await apiClient.post('/api/groups', groupData);
  return response.data;
};

// Obtener todos los grupos públicos
export const fetchGroups = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/api/groups', { params });
  return response.data;
};

// Obtener los grupos del usuario
export const fetchUserGroups = async () => {
  const response = await apiClient.get('/api/groups/me/groups');
  return response.data;
};

// Obtener un grupo por ID
export const fetchGroupById = async (id: string) => {
  const response = await apiClient.get(`/groups/${id}`);
  return response.data;
};

// Unirse a un grupo
export const joinGroup = async (id: string) => {
  const response = await apiClient.post(`/groups/${id}/join`);
  return response.data;
};

// Salir de un grupo
export const leaveGroup = async (id: string) => {
  const response = await apiClient.post(`/groups/${id}/leave`);
  return response.data;
};

// Actualizar información del grupo
export const updateGroup = async (id: string, groupData: Partial<CreateGroupData>) => {
  const response = await apiClient.put(`/groups/${id}`, groupData);
  return response.data;
};

// Actualizar rol de un miembro
export const updateMemberRole = async (groupId: string, memberId: string, role: string) => {
  const response = await apiClient.patch(`/groups/${groupId}/members/${memberId}/role`, { role });
  return response.data;
};

// Remover miembro del grupo
export const removeMember = async (groupId: string, memberId: string) => {
  const response = await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
  return response.data;
};

// Obtener estadísticas del grupo
export const getGroupStats = async (groupId: string) => {
  const response = await apiClient.get(`/groups/${groupId}/stats`);
  return response.data;
};

// Transferir propiedad del grupo
export const transferOwnership = async (groupId: string, newOwnerId: string) => {
  const response = await apiClient.post(`/groups/${groupId}/transfer-ownership`, { newOwnerId });
  return response.data;
};

// Eliminar un grupo
export const deleteGroup = async (id: string) => {
  const response = await apiClient.delete(`/groups/${id}`);
  return response.data;
};

// === CATEGORÍAS DE GRUPOS ===

// Obtener todas las categorías
export const fetchGroupCategories = async () => {
  const response = await apiClient.get('/api/groups/categories');
  return response.data;
};

// Crear una nueva categoría (solo admin)
export const createGroupCategory = async (categoryData: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) => {
  const response = await apiClient.post('/api/groups/categories', categoryData);
  return response.data;
};

// Actualizar una categoría (solo admin)
export const updateGroupCategory = async (id: string, categoryData: {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}) => {
  const response = await apiClient.put(`/groups/categories/${id}`, categoryData);
  return response.data;
};

// Eliminar una categoría (solo admin)
export const deleteGroupCategory = async (id: string) => {
  const response = await apiClient.delete(`/groups/categories/${id}`);
  return response.data;
};