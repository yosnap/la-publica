import apiClient from './client';

export interface JobOffer {
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
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  requirements: string[];
  benefits?: string[];
  skills: string[];
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  category: string;
  isActive: boolean;
  applicationDeadline?: string;
  applications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobOfferData {
  companyId: string;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  requirements: string[];
  benefits?: string[];
  skills: string[];
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  category: string;
  applicationDeadline?: string;
}

export interface UpdateJobOfferData extends Partial<Omit<CreateJobOfferData, 'companyId'>> {
  isActive?: boolean;
}

// API functions
export const getJobOffers = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  employmentType?: string;
  experienceLevel?: string;
  isRemote?: boolean;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.employmentType) queryParams.append('employmentType', params.employmentType);
  if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
  if (params?.isRemote !== undefined) queryParams.append('isRemote', params.isRemote.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());
  if (params?.salaryMax) queryParams.append('salaryMax', params.salaryMax.toString());
  
  const response = await apiClient.get(`/job-offers?${queryParams.toString()}`);
  return response.data;
};

export const getJobOfferById = async (id: string) => {
  const response = await apiClient.get(`/job-offers/${id}`);
  return response.data;
};

export const createJobOffer = async (data: CreateJobOfferData) => {
  const response = await apiClient.post('/job-offers', data);
  return response.data;
};

export const updateJobOffer = async (id: string, data: UpdateJobOfferData) => {
  const response = await apiClient.put(`/job-offers/${id}`, data);
  return response.data;
};

export const deleteJobOffer = async (id: string) => {
  const response = await apiClient.delete(`/job-offers/${id}`);
  return response.data;
};

export const getMyJobOffers = async () => {
  const response = await apiClient.get('/job-offers/my/offers');
  return response.data;
};

export const getJobOffersByCompany = async (companyId: string, params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  
  const response = await apiClient.get(`/job-offers/company/${companyId}?${queryParams.toString()}`);
  return response.data;
};