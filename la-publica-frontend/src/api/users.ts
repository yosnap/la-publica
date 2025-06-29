import apiClient from './client';

// Get all users
export const fetchAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
}; 