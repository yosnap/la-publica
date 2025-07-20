import apiClient from './client';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  slug: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'colaborador' | 'admin';
  isActive: boolean;
  followers: string[];
  following: string[];
  createdAt: string;
  lastActive?: string;
  bio?: string;
  location?: string;
}

// Get all users
export const fetchAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'active' | 'popular';
}) => {
  const response = await apiClient.get('/api/users', { params });
  return response.data;
};

// Follow/unfollow a user
export const toggleFollowUser = async (userId: string) => {
  const response = await apiClient.post(`/api/users/${userId}/follow`);
  return response.data;
};

// Get user followers
export const getUserFollowers = async (userId: string) => {
  const response = await apiClient.get(`/api/users/${userId}/followers`);
  return response.data;
};

// Get user following
export const getUserFollowing = async (userId: string) => {
  const response = await apiClient.get(`/api/users/${userId}/following`);
  return response.data;
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.data.data; // Extract the data field from the API response
};

// Get user by slug
export const getUserBySlug = async (userSlug: string) => {
  const response = await apiClient.get(`/api/users/slug/${userSlug}`);
  return response.data.data; // Extract the data field from the API response
};

// Send message to user (placeholder for messaging system)
export const sendUserMessage = async (userId: string, message: string) => {
  const response = await apiClient.post(`/api/users/${userId}/message`, { message });
  return response.data;
}; 