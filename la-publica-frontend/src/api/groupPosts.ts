import apiClient from './client';

 // Tipos para posts de grupos
export interface GroupPost {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  group: {
    _id: string;
    name: string;
  };
  images?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: Array<{
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
  mood?: {
    emoji: string;
    label: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    content: string;
    createdAt: string;
    likes: string[];
  }>;
  isPinned: boolean;
  isApproved: boolean;
  commentsDisabled: boolean;
  privacy: 'public' | 'members_only';
  moderationNote?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  editHistory?: Array<{
    content: string;
    editedAt: string;
    editedBy: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface CreateGroupPostData {
  content: string;
  images?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: string[];
  mood?: {
    emoji: string;
    label: string;
  };
  privacy?: 'public' | 'members_only';
}

export interface GroupPostsResponse {
  success: boolean;
  data: GroupPost[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface SingleGroupPostResponse {
  success: boolean;
  data: GroupPost;
  message?: string;
}

 // Crear un post en un grupo
export const createGroupPost = async (groupId: string, postData: CreateGroupPostData) => {
  const response = await apiClient.post(`/groups/${groupId}/posts`, postData);
  return response.data;
};

 // Obtener posts de un grupo
export const fetchGroupPosts = async (
  groupId: string, 
  params?: {
    page?: number;
    limit?: number;
    pinned?: boolean;
  }
): Promise<GroupPostsResponse> => {
  const response = await apiClient.get(`/groups/${groupId}/posts`, { params });
  return response.data;
};

 // Obtener un post específico
export const fetchGroupPostById = async (groupId: string, postId: string): Promise<SingleGroupPostResponse> => {
  const response = await apiClient.get(`/groups/${groupId}/posts/${postId}`);
  return response.data;
};

 // Actualizar un post
export const updateGroupPost = async (
  groupId: string, 
  postId: string, 
  postData: Partial<CreateGroupPostData>
) => {
  const response = await apiClient.put(`/groups/${groupId}/posts/${postId}`, postData);
  return response.data;
};

 // Eliminar un post
export const deleteGroupPost = async (groupId: string, postId: string) => {
  const response = await apiClient.delete(`/groups/${groupId}/posts/${postId}`);
  return response.data;
};

 // Like/Unlike un post
export const toggleLikeGroupPost = async (groupId: string, postId: string) => {
  const response = await apiClient.post(`/groups/${groupId}/posts/${postId}/like`);
  return response.data;
};

 // Agregar comentario
export const addCommentToGroupPost = async (
  groupId: string, 
  postId: string, 
  content: string
) => {
  const response = await apiClient.post(`/groups/${groupId}/posts/${postId}/comments`, { content });
  return response.data;
};

 // Eliminar comentario
export const deleteCommentFromGroupPost = async (
  groupId: string, 
  postId: string, 
  commentId: string
) => {
  const response = await apiClient.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`);
  return response.data;
};

 // Fijar/Desfijar post (solo admin/moderador)
export const togglePinGroupPost = async (groupId: string, postId: string) => {
  const response = await apiClient.patch(`/groups/${groupId}/posts/${postId}/pin`);
  return response.data;
};

 // Habilitar/Deshabilitar comentarios (solo admin/moderador)
export const toggleCommentsGroupPost = async (groupId: string, postId: string) => {
  const response = await apiClient.patch(`/groups/${groupId}/posts/${postId}/comments/toggle`);
  return response.data;
};