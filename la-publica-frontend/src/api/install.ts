import apiClient from './client';

export interface InstallationStatus {
  isInstalled: boolean;
  hasAdminUser: boolean;
  systemVersion: string;
}

export interface InstallSystemRequest {
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface InstallSystemResponse {
  success: boolean;
  message: string;
  data: {
    adminUser: {
      id: string;
      email: string;
      username: string;
      role: string;
    };
    installationDate: string;
    nextSteps: string[];
  };
}

// Verificar el estado de instalación del sistema
export const checkInstallationStatus = async (): Promise<{
  success: boolean;
  data: InstallationStatus;
}> => {
  const response = await apiClient.get('/install/status');
  return response.data;
};

// Instalar el sistema (crear admin y configuración inicial)
export const installSystem = async (data: InstallSystemRequest): Promise<InstallSystemResponse> => {
  const response = await apiClient.post('/install', data);
  return response.data;
};
