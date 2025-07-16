import apiClient from './client';

// Get all posts (public)
export const fetchPosts = async () => {
  const response = await apiClient.get('/api/posts');
  return response.data;
};

// Get personalized feed for the logged user
export const fetchUserFeed = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/api/posts/feed/me', {
    params: { page, limit },
  });
  return response.data;
};

// Create a new post
export const createPost = async (content: string, image?: string, mood?: {emoji: string, label: string}) => {
  const response = await apiClient.post('/api/posts', { 
    content,
    ...(image && { image }),
    ...(mood && { mood })
  });
  return response.data;
};

// Get a post by ID
export const fetchPostById = async (id: string) => {
  const response = await apiClient.get(`/api/posts/${id}`);
  return response.data;
};

// Like or unlike a post
export const toggleLikePost = async (id: string) => {
  const response = await apiClient.post(`/api/posts/${id}/like`);
  return response.data;
};

// Add a comment to a post
export const commentOnPost = async (id: string, text: string) => {
  const response = await apiClient.post(`/api/posts/${id}/comment`, { text });
  return response.data;
};

// Actualizar un post existente
export const updatePost = async (id: string, content: string) => {
  const response = await apiClient.put(`/api/posts/${id}`, { content });
  return response.data;
};

// Desactivar/activar comentarios en un post
export const togglePostComments = async (id: string) => {
  const response = await apiClient.patch(`/api/posts/${id}/toggle-comments`);
  return response.data;
};

// Fijar/desfijar post en el feed
export const togglePostPin = async (id: string) => {
  const response = await apiClient.patch(`/api/posts/${id}/toggle-pin`);
  return response.data;
};

// Future: Add functions for tagging users, hashtags, categories, scheduling, attachments, etc. 