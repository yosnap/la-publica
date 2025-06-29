import apiClient from './client';

// Get all posts (public)
export const fetchPosts = async () => {
  const response = await apiClient.get('/posts');
  return response.data;
};

// Get personalized feed for the logged user
export const fetchUserFeed = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/posts/feed/me', {
    params: { page, limit },
  });
  return response.data;
};

// Create a new post
export const createPost = async (content: string) => {
  // TODO: Add support for mentions, hashtags, categories, scheduling
  const response = await apiClient.post('/posts', { content });
  return response.data;
};

// Get a post by ID
export const fetchPostById = async (id: string) => {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data;
};

// Like or unlike a post
export const toggleLikePost = async (id: string) => {
  const response = await apiClient.post(`/posts/${id}/like`);
  return response.data;
};

// Add a comment to a post
export const commentOnPost = async (id: string, text: string) => {
  const response = await apiClient.post(`/posts/${id}/comment`, { text });
  return response.data;
};

// Actualizar un post existente
export const updatePost = async (id: string, content: string) => {
  const response = await apiClient.put(`/posts/${id}`, { content });
  return response.data;
};

// Future: Add functions for tagging users, hashtags, categories, scheduling, attachments, etc. 