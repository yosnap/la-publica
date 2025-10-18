import apiClient from './client';

// Tipos
export interface Coupon {
  code: string;
  discountPercentage: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date | string;
  validUntil: Date | string;
  isActive: boolean;
}

export interface Offer {
  _id: string;
  title: string;
  slug: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date | string;
  endDate: Date | string;
  stock: number;
  remainingStock: number;
  included: string[];
  notIncluded: string[];
  usageInstructions: string;
  mainImage: string;
  gallery: string[];
  videoUrl?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    _id: string;
    name: string;
    logo?: string;
  };
  targetGroups: string[];
  category?: string;
  coupons: Coupon[];
  isActive: boolean;
  isPaused: boolean;
  views: number;
  purchases: number;
  isCurrentlyActive?: boolean;
  isSoldOut?: boolean;
  isExpired?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOfferData {
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  startDate: Date | string;
  endDate: Date | string;
  stock: number;
  included: string[];
  notIncluded: string[];
  usageInstructions: string;
  mainImage: string;
  gallery?: string[];
  videoUrl?: string;
  company?: string;
  targetGroups?: string[];
  category?: string;
}

export interface UpdateOfferData extends Partial<CreateOfferData> {}

export interface CreateCouponData {
  code: string;
  discountPercentage: number;
  maxUses?: number;
  validFrom: Date | string;
  validUntil: Date | string;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  coupon: {
    code: string;
    discountPercentage: number;
  };
  pricing: {
    originalPrice: number;
    baseDiscountedPrice: number;
    couponDiscount: number;
    finalPrice: number;
    totalDiscount: number;
    totalDiscountPercentage: number;
  };
}

// Obtener todas las ofertas (con filtros opcionales)
export const getAllOffers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  company?: string;
  active?: boolean;
  sortBy?: 'recent' | 'popular' | 'ending-soon' | 'best-discount';
}) => {
  const response = await apiClient.get('/api/offers', { params });
  return response.data;
};

// Obtener una oferta por slug
export const getOfferBySlug = async (slug: string) => {
  const response = await apiClient.get(`/api/offers/${slug}`);
  return response.data;
};

// Crear una nueva oferta (solo colaboradores y admin)
export const createOffer = async (data: CreateOfferData) => {
  const response = await apiClient.post('/api/offers', data);
  return response.data;
};

// Actualizar una oferta (solo creador o admin)
export const updateOffer = async (id: string, data: UpdateOfferData) => {
  const response = await apiClient.put(`/api/offers/${id}`, data);
  return response.data;
};

// Eliminar una oferta (solo creador o admin)
export const deleteOffer = async (id: string) => {
  const response = await apiClient.delete(`/api/offers/${id}`);
  return response.data;
};

// Pausar/Reanudar una oferta
export const togglePauseOffer = async (id: string) => {
  const response = await apiClient.patch(`/api/offers/${id}/toggle-pause`);
  return response.data;
};

// Obtener las ofertas creadas por el usuario actual
export const getMyOffers = async (params?: {
  status?: 'all' | 'active' | 'paused' | 'expired';
}) => {
  const response = await apiClient.get('/api/offers/my-offers', { params });
  return response.data;
};

// Crear un cupón para una oferta
export const createCoupon = async (offerId: string, data: CreateCouponData) => {
  const response = await apiClient.post(`/api/offers/${offerId}/coupons`, data);
  return response.data;
};

// Validar un cupón
export const validateCoupon = async (offerId: string, code: string): Promise<ValidateCouponResponse> => {
  const response = await apiClient.post(`/api/offers/${offerId}/coupons/validate`, { code });
  return response.data;
};

// Desactivar un cupón
export const deactivateCoupon = async (offerId: string, code: string) => {
  const response = await apiClient.patch(`/api/offers/${offerId}/coupons/${code}/deactivate`);
  return response.data;
};

// Obtener ofertas por empresa
export const getOffersByCompany = async (companyId: string) => {
  const response = await apiClient.get('/api/offers', { params: { company: companyId } });
  return response.data;
};
