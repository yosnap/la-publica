import apiClient from './client';

export interface Advisory {
  _id: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
    location: {
      city: string;
      country: string;
    };
    verified: {
      status: 'pending' | 'verified' | 'rejected';
    };
  };
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  expertise: string[];
  pricing: {
    type: 'free' | 'paid' | 'consultation';
    hourlyRate?: number;
    sessionRate?: number;
    currency: string;
    sessionDuration: number;
  };
  availability: {
    schedule: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      available: boolean;
    }[];
    timezone: string;
    advanceBooking: number;
  };
  format: 'video' | 'phone' | 'in-person' | 'email' | 'chat';
  languages: string[];
  requirements?: string[];
  isActive: boolean;
  bookings: string[];
  reviews: {
    user: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
  stats: {
    totalBookings: number;
    averageRating: number;
    completedSessions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvisoryData {
  companyId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  expertise: string[];
  pricing: {
    type: 'free' | 'paid' | 'consultation';
    hourlyRate?: number;
    sessionRate?: number;
    currency: string;
    sessionDuration: number;
  };
  availability: {
    schedule: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      available: boolean;
    }[];
    timezone: string;
    advanceBooking: number;
  };
  format: 'video' | 'phone' | 'in-person' | 'email' | 'chat';
  languages: string[];
  requirements?: string[];
}

export interface UpdateAdvisoryData extends Partial<Omit<CreateAdvisoryData, 'companyId'>> {
  isActive?: boolean;
}

// API functions
export const getAdvisories = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  format?: string;
  priceType?: string;
  language?: string;
  search?: string;
  minRating?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.subcategory) queryParams.append('subcategory', params.subcategory);
  if (params?.format) queryParams.append('format', params.format);
  if (params?.priceType) queryParams.append('priceType', params.priceType);
  if (params?.language) queryParams.append('language', params.language);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
  
  const response = await apiClient.get(`/advisories?${queryParams.toString()}`);
  return response.data;
};

export const getAdvisoryById = async (id: string) => {
  const response = await apiClient.get(`/advisories/${id}`);
  return response.data;
};

export const createAdvisory = async (data: CreateAdvisoryData) => {
  const response = await apiClient.post('/advisories', data);
  return response.data;
};

export const updateAdvisory = async (id: string, data: UpdateAdvisoryData) => {
  const response = await apiClient.put(`/advisories/${id}`, data);
  return response.data;
};

export const deleteAdvisory = async (id: string) => {
  const response = await apiClient.delete(`/advisories/${id}`);
  return response.data;
};

export const getMyAdvisories = async () => {
  const response = await apiClient.get('/advisories/my/advisories');
  return response.data;
};

export const getAdvisoriesByCompany = async (companyId: string, params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  
  const response = await apiClient.get(`/advisories/company/${companyId}?${queryParams.toString()}`);
  return response.data;
};

export const addReview = async (id: string, data: { rating: number; comment?: string }) => {
  const response = await apiClient.post(`/advisories/${id}/reviews`, data);
  return response.data;
};

export const getPopularCategories = async () => {
  const response = await apiClient.get('/advisories/categories/popular');
  return response.data;
};