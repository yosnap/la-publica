import apiClient from './client';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  status?: 'active' | 'inactive' | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'colaborador';
  isActive: boolean;
  createdAt: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  likes: string[];
  comments: any[];
  createdAt: string;
  isActive: boolean;
}

export interface Company {
  _id: string;
  name: string;
  description: string;
  category: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  verified: {
    status: 'verified' | 'pending' | 'rejected';
  };
  createdAt: string;
  isActive: boolean;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    _id: string;
    name: string;
    color: string;
  };
  privacy: 'public' | 'private';
  memberCount: number;
  postCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface Forum {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    _id: string;
    name: string;
    color: string;
  };
  topicCount: number;
  postCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface JobOffer {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
  };
  category: string;
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  isActive: boolean;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: 'offer' | 'demand';
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: string;
  price: {
    amount?: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'daily' | 'negotiable';
  };
  location?: {
    city: string;
    country: string;
    allowRemote?: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Advisory {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
  };
  category: string;
  expertise: string[];
  pricing: {
    type: 'free' | 'paid' | 'consultation';
    hourlyRate?: number;
    sessionRate?: number;
    sessionDuration?: number;
    currency: string;
  };
  format: 'video' | 'phone' | 'in-person' | 'email' | 'chat';
  languages: string[];
  stats: {
    totalBookings: number;
    averageRating: number;
    completedSessions: number;
  };
  isActive: boolean;
  createdAt: string;
}

// Helper function to build query parameters
const buildQueryParams = (params: PaginationParams): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString();
};

// Users Management
export const getUsers = async (params: PaginationParams = {}): Promise<AdminResponse<User>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/users?${queryString}`);
  return response.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{
  success: boolean;
  data: User;
  message: string;
}> => {
  const response = await apiClient.put(`/admin-data/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string, permanent = false): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await apiClient.delete(`/admin-data/users/${userId}`, {
    data: { permanent }
  });
  return response.data;
};

// Posts Management
export const getPosts = async (params: PaginationParams = {}): Promise<AdminResponse<Post>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/posts?${queryString}`);
  return response.data;
};

export const updatePost = async (postId: string, postData: Partial<Post>): Promise<{
  success: boolean;
  data: Post;
  message: string;
}> => {
  const response = await apiClient.put(`/admin-data/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId: string, permanent = false): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await apiClient.delete(`/admin-data/posts/${postId}`, {
    data: { permanent }
  });
  return response.data;
};

// Companies Management
export const getCompanies = async (params: PaginationParams = {}): Promise<AdminResponse<Company>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/companies?${queryString}`);
  return response.data;
};

export const updateCompany = async (companyId: string, companyData: Partial<Company>): Promise<{
  success: boolean;
  data: Company;
  message: string;
}> => {
  const response = await apiClient.put(`/admin-data/companies/${companyId}`, companyData);
  return response.data;
};

// Groups Management
export const getGroups = async (params: PaginationParams = {}): Promise<AdminResponse<Group>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/groups?${queryString}`);
  return response.data;
};

// Forums Management
export const getForums = async (params: PaginationParams = {}): Promise<AdminResponse<Forum>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/forums?${queryString}`);
  return response.data;
};

// Job Offers Management
export const getJobOffers = async (params: PaginationParams = {}): Promise<AdminResponse<JobOffer>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/job-offers?${queryString}`);
  return response.data;
};

// Announcements Management
export const getAnnouncements = async (params: PaginationParams = {}): Promise<AdminResponse<Announcement>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/announcements?${queryString}`);
  return response.data;
};

// Advisories Management
export const getAdvisories = async (params: PaginationParams = {}): Promise<AdminResponse<Advisory>> => {
  const queryString = buildQueryParams(params);
  const response = await apiClient.get(`/admin-data/advisories?${queryString}`);
  return response.data;
};

// Bulk Operations
export const bulkUpdateItems = async (
  model: string, 
  itemIds: string[], 
  updateData: Record<string, any>
): Promise<{
  success: boolean;
  data: any;
  message: string;
}> => {
  const response = await apiClient.post('/admin-data/bulk/update', {
    model,
    itemIds,
    updateData
  });
  return response.data;
};

export const bulkDeleteItems = async (
  model: string, 
  itemIds: string[], 
  permanent = false
): Promise<{
  success: boolean;
  data: any;
  message: string;
}> => {
  const response = await apiClient.post('/admin-data/bulk/delete', {
    model,
    itemIds,
    permanent
  });
  return response.data;
};

// Author and Category Assignment
export const assignAuthor = async (
  model: string, 
  itemId: string, 
  authorId: string
): Promise<{
  success: boolean;
  data: any;
  message: string;
}> => {
  const response = await apiClient.post('/admin-data/assign/author', {
    model,
    itemId,
    authorId
  });
  return response.data;
};

export const assignCategory = async (
  model: string, 
  itemId: string, 
  categoryId: string
): Promise<{
  success: boolean;
  data: any;
  message: string;
}> => {
  const response = await apiClient.post('/admin-data/assign/category', {
    model,
    itemId,
    categoryId
  });
  return response.data;
};