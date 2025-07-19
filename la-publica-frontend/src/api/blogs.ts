import apiClient from './client';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: {
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  viewCount: number;
  featured: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt: string;
  tags?: string[];
  category: string;
  coverImage?: string;
  status?: 'draft' | 'published';
  featured?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateBlogData extends Partial<CreateBlogData> {}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  totalViews: number;
  categoriesWithCount: Array<{
    _id: string;
    name: string;
    count: number;
  }>;
}

export interface PopularTag {
  tag: string;
  count: number;
}

// Obtener todos los blogs
export const getBlogs = async (filters: BlogFilters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/api/blogs?${params.toString()}`);
  return response.data;
};

// Obtener un blog por slug
export const getBlogBySlug = async (slug: string) => {
  const response = await apiClient.get(`/api/blogs/${slug}`);
  return response.data;
};

// Obtener un blog por ID (para edición)
export const getBlogById = async (id: string) => {
  const response = await apiClient.get(`/api/blogs/edit/${id}`);
  return response.data;
};

// Crear un nuevo blog
export const createBlog = async (data: CreateBlogData) => {
  const response = await apiClient.post('/api/blogs', data);
  return response.data;
};

// Actualizar un blog
export const updateBlog = async (id: string, data: UpdateBlogData) => {
  const response = await apiClient.put(`/api/blogs/${id}`, data);
  return response.data;
};

// Eliminar un blog
export const deleteBlog = async (id: string) => {
  const response = await apiClient.delete(`/api/blogs/${id}`);
  return response.data;
};

// Obtener mis blogs
export const getMyBlogs = async (filters: BlogFilters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/api/blogs/my/all?${params.toString()}`);
  return response.data;
};

// Obtener estadísticas de blogs
export const getBlogStats = async () => {
  const response = await apiClient.get('/api/blogs/stats');
  return response.data;
};

// Obtener tags populares
export const getPopularTags = async () => {
  const response = await apiClient.get('/api/blogs/tags/popular');
  return response.data;
};

// Obtener categorías de blogs
export const getBlogCategories = async () => {
  const response = await apiClient.get('/api/categories?type=blog');
  return response.data;
};