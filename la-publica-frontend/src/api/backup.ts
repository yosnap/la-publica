import apiClient from './client';

export interface BackupConfiguration {
  version: string;
  exportDate: string;
  platform: string;
  data: {
    groupCategories: Array<{
      name: string;
      description?: string;
      color: string;
      icon: string;
      isActive: boolean;
    }>;
    forumCategories: Array<{
      name: string;
      description?: string;
      color: string;
      icon: string;
      isActive: boolean;
    }>;
    forums: Array<{
      name: string;
      description: string;
      categoryName: string;
      rules: string[];
      isPinned: boolean;
      isLocked: boolean;
      isActive: boolean;
    }>;
  };
  statistics: {
    totalGroupCategories: number;
    totalForumCategories: number;
    totalForums: number;
  };
}

export interface ImportOptions {
  replaceExisting?: boolean;
  importGroupCategories?: boolean;
  importForumCategories?: boolean;
  importForums?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    groupCategories: number;
    forumCategories: number;
    forums: number;
  };
}

export interface ImportResult {
  groupCategories: { created: number; skipped: number; errors: number };
  forumCategories: { created: number; skipped: number; errors: number };
  forums: { created: number; skipped: number; errors: number };
}

 // Exportar configuración de la plataforma
export const exportConfiguration = async (): Promise<BackupConfiguration> => {
  const response = await apiClient.get('/backup/export');
  return response.data;
};

 // Importar configuración de la plataforma
export const importConfiguration = async (
  configuration: BackupConfiguration,
  options: ImportOptions = {}
) => {
  const response = await apiClient.post('/backup/import', {
    configuration,
    options
  });
  return response.data;
};

 // Validar archivo de configuración
export const validateConfiguration = async (
  configuration: BackupConfiguration
): Promise<{ success: boolean; data: ValidationResult }> => {
  const response = await apiClient.post('/backup/validate', {
    configuration
  });
  return response.data;
};

 // Utility para descargar el archivo de configuración
export const downloadConfigurationFile = (configuration: BackupConfiguration, filename?: string) => {
  const dataStr = JSON.stringify(configuration, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `la-publica-config-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

 // Utility para leer archivo JSON
export const readConfigurationFile = (file: File): Promise<BackupConfiguration> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const configuration = JSON.parse(e.target?.result as string);
        resolve(configuration);
      } catch (error) {
        reject(new Error('Archivo JSON inválido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
};