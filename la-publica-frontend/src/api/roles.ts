import apiClient from './client';

// Interfaces para roles y permisos
export interface ResourcePermission {
  resource: string;
  actions: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    publish?: boolean;
    moderate?: boolean;
    export?: boolean;
    import?: boolean;
    approve?: boolean;
  };
  scope: 'none' | 'own' | 'department' | 'all';
  conditions?: Record<string, any>;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: ResourcePermission[];
  priority: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  resource: string;
  resourceGroup: string;
  label: string;
  description?: string;
  availableActions: {
    action: string;
    label: string;
    description?: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: ResourcePermission[];
  priority?: number;
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  isActive?: boolean;
}

export interface RoleAuditLog {
  _id: string;
  action: string;
  roleId: string;
  roleName: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// API functions para roles
export const getRoles = async (params?: {
  includeInactive?: boolean;
  includeSystem?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.includeInactive) queryParams.append('includeInactive', 'true');
  if (params?.includeSystem !== undefined) queryParams.append('includeSystem', String(params.includeSystem));
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const response = await apiClient.get(`/admin/roles?${queryParams.toString()}`);
  return response.data;
};

export const getRoleById = async (id: string) => {
  const response = await apiClient.get(`/admin/roles/${id}`);
  return response.data;
};

export const createRole = async (data: CreateRoleData) => {
  const response = await apiClient.post('/admin/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: UpdateRoleData) => {
  const response = await apiClient.put(`/admin/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await apiClient.delete(`/admin/roles/${id}`);
  return response.data;
};

export const cloneRole = async (id: string, name: string) => {
  const response = await apiClient.post(`/admin/roles/${id}/clone`, { name });
  return response.data;
};

export const getRoleAuditLogs = async (id: string, params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await apiClient.get(`/admin/roles/${id}/audit?${queryParams.toString()}`);
  return response.data;
};

export const assignRoleToUser = async (userId: string, roleId: string) => {
  const response = await apiClient.post(`/admin/roles/assign/${userId}`, { roleId });
  return response.data;
};

export const removeRoleFromUser = async (userId: string, roleId: string) => {
  const response = await apiClient.delete(`/admin/roles/assign/${userId}/${roleId}`);
  return response.data;
};

// API functions para permisos
export const getPermissions = async (params?: {
  resourceGroup?: string;
  isActive?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.resourceGroup) queryParams.append('resourceGroup', params.resourceGroup);
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

  const response = await apiClient.get(`/admin/permissions?${queryParams.toString()}`);
  return response.data;
};

export const getGroupedPermissions = async () => {
  const response = await apiClient.get('/admin/permissions/grouped');
  return response.data;
};

export const getUserPermissions = async (userId: string) => {
  const response = await apiClient.get(`/admin/permissions/user/${userId}`);
  return response.data;
};

export const getMyPermissions = async () => {
  const response = await apiClient.get('/auth/my-permissions');
  return response.data;
};

export const checkPermission = async (resource: string, action: string, ownerId?: string) => {
  const response = await apiClient.post('/auth/check-permission', {
    resource,
    action,
    ownerId
  });
  return response.data;
};

export const updateUserRoleOverrides = async (userId: string, roleOverrides: ResourcePermission[]) => {
  const response = await apiClient.put(`/admin/permissions/user/${userId}/overrides`, {
    roleOverrides
  });
  return response.data;
};

export const invalidateUserCache = async (userId: string) => {
  const response = await apiClient.post(`/admin/permissions/invalidate-cache/${userId}`);
  return response.data;
};

export const invalidateAllCache = async () => {
  const response = await apiClient.post('/admin/permissions/invalidate-all-cache');
  return response.data;
};
