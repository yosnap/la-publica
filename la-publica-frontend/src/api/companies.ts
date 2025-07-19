import apiClient from './client';

export interface Company {
  _id: string;
  owner: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  email: string;
  phone?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  verified: {
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: string;
    documents?: string[];
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  stats: {
    employees?: number;
    founded?: number;
    revenue?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  email: string;
  phone?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  stats: {
    employees?: number;
    founded?: number;
    revenue?: string;
  };
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {}

// API functions
export const getCompanies = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  verified?: boolean;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const response = await apiClient.get(`/companies?${queryParams.toString()}`);
  return response.data;
};

export const getCompanyById = async (id: string) => {
  const response = await apiClient.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (data: CreateCompanyData) => {
  const response = await apiClient.post('/companies', data);
  return response.data;
};

export const updateCompany = async (id: string, data: UpdateCompanyData) => {
  const response = await apiClient.put(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: string) => {
  const response = await apiClient.delete(`/companies/${id}`);
  return response.data;
};

export const getMyCompanies = async () => {
  const response = await apiClient.get('/companies/my/companies');
  return response.data;
};

export const updateVerificationStatus = async (id: string, status: 'pending' | 'verified' | 'rejected') => {
  const response = await apiClient.patch(`/companies/${id}/verification`, { status });
  return response.data;
};