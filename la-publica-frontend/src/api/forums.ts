import apiClient from './client';

export interface Forum {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  moderators: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
  isActive: boolean;
  isPinned: boolean;
  isLocked: boolean;
  topicCount: number;
  postCount: number;
  lastPost?: {
    postId: string;
    author: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePhoto?: string;
    };
    authorName: string;
    title: string;
    createdAt: string;
  };
  rules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  forum: {
    _id: string;
    name: string;
  };
  parentPost?: string;
  isActive: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  likes: string[];
  dislikes: string[];
  replyCount: number;
  viewCount: number;
  lastActivity: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// === FUNCIONES DE FOROS ===

// Obtener todos los foros
export const fetchForums = async (params?: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const response = await apiClient.get(`/forums?${searchParams.toString()}`);
  return response.data;
};

// Obtener un foro por ID
export const getForumById = async (id: string) => {
  const response = await apiClient.get(`/forums/${id}`);
  return response.data;
};

// Crear un nuevo foro (solo admin)
export const createForum = async (data: {
  name: string;
  description: string;
  categoryId: string;
  moderators?: string[];
  rules?: string[];
}) => {
  const response = await apiClient.post('/api/forums', data);
  return response.data;
};

// Actualizar un foro
export const updateForum = async (id: string, data: Partial<Forum>) => {
  const response = await apiClient.put(`/api/forums/${id}`, data);
  return response.data;
};

// Eliminar un foro (solo admin)
export const deleteForum = async (id: string) => {
  const response = await apiClient.delete(`/forums/${id}`);
  return response.data;
};

// === FUNCIONES DE POSTS ===

// Obtener posts de un foro
export const getForumPosts = async (forumId: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'mostLiked' | 'mostReplies' | 'lastActivity';
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  
  const response = await apiClient.get(`/forums/${forumId}/posts?${searchParams.toString()}`);
  return response.data;
};

// Obtener un post específico con respuestas
export const getForumPostById = async (id: string, params?: {
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const response = await apiClient.get(`/forums/posts/${id}?${searchParams.toString()}`);
  return response.data;
};

// Crear un nuevo post
export const createForumPost = async (data: {
  title: string;
  content: string;
  forumId: string;
  parentPostId?: string;
  tags?: string[];
}) => {
  const response = await apiClient.post('/api/forums/posts', data);
  return response.data;
};

// Dar like a un post
export const likeForumPost = async (id: string) => {
  const response = await apiClient.post(`/forums/posts/${id}/like`);
  return response.data;
};

// Dar dislike a un post
export const dislikeForumPost = async (id: string) => {
  const response = await apiClient.post(`/forums/posts/${id}/dislike`);
  return response.data;
};

// Reportar un post
export const reportForumPost = async (id: string, data: {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'copyright' | 'other';
  description?: string;
}) => {
  const response = await apiClient.post(`/forums/posts/${id}/report`, data);
  return response.data;
};

// Editar un post
export const editForumPost = async (id: string, data: {
  title?: string;
  content?: string;
  reason?: string;
}) => {
  const response = await apiClient.put(`/forums/posts/${id}`, data);
  return response.data;
};

// Eliminar un post
export const deleteForumPost = async (id: string) => {
  const response = await apiClient.delete(`/forums/posts/${id}`);
  return response.data;
};