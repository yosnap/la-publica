import apiClient from './client';

export interface BackupOptions {
  includeUsers?: boolean;
  includePosts?: boolean;
  includeCompanies?: boolean;
  includeGroups?: boolean;
  includeGroupPosts?: boolean;
  includeForums?: boolean;
  includeForumPosts?: boolean;
  includeJobOffers?: boolean;
  includeAnnouncements?: boolean;
  includeAdvisories?: boolean;
  includeBlogs?: boolean;
  includeCategories?: boolean;
  includeGroupCategories?: boolean;
  includeForumCategories?: boolean;
  
  // Date range options
  dateFrom?: string;
  dateTo?: string;
  
  // Author filter
  authorId?: string;
  
  // Category filter
  categoryFilter?: string[];
  
  // Limit options
  maxRecords?: number;
}

export interface BackupStatistics {
  users: number;
  posts: number;
  companies: number;
  groups: number;
  groupPosts: number;
  forums: number;
  forumPosts: number;
  jobOffers: number;
  announcements: number;
  advisories: number;
  blogs: number;
  categories: number;
  groupCategories: number;
  forumCategories: number;
}

export interface BackupPreview {
  statistics: BackupStatistics;
  filters: BackupOptions;
  totalRecords: number;
}

export interface BackupData {
  version: string;
  exportDate: string;
  platform: string;
  options: BackupOptions;
  statistics: BackupStatistics;
  data: Record<string, any[]>;
}

export interface ImportOptions {
  replaceExisting?: boolean;
  importUsers?: boolean;
  importPosts?: boolean;
  importCompanies?: boolean;
  importGroups?: boolean;
  importGroupPosts?: boolean;
  importForums?: boolean;
  importForumPosts?: boolean;
  importJobOffers?: boolean;
  importAnnouncements?: boolean;
  importAdvisories?: boolean;
  importBlogs?: boolean;
  importCategories?: boolean;
  importGroupCategories?: boolean;
  importForumCategories?: boolean;
}

export interface ImportResult {
  [key: string]: {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

// Get backup preview/statistics
export const getBackupPreview = async (filters?: Partial<BackupOptions>): Promise<{
  success: boolean;
  data: BackupPreview;
}> => {
  const params = new URLSearchParams();
  
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.authorId) params.append('authorId', filters.authorId);
  if (filters?.categoryFilter?.length) {
    params.append('categoryFilter', filters.categoryFilter.join(','));
  }
  
  const response = await apiClient.get(`/granular-backup/preview?${params.toString()}`);
  return response.data;
};

// Export granular data
export const exportGranularData = async (options: BackupOptions): Promise<BackupData> => {
  const response = await apiClient.post('/granular-backup/export', options, {
    responseType: 'json'
  });
  return response.data;
};

// Import granular data
export const importGranularData = async (
  backupData: BackupData, 
  options: ImportOptions
): Promise<{
  success: boolean;
  data: {
    importedAt: string;
    results: ImportResult;
    options: ImportOptions;
  };
}> => {
  const response = await apiClient.post('/granular-backup/import', {
    backupData,
    options
  });
  return response.data;
};

// Utility function to download backup file
export const downloadBackupFile = (backupData: BackupData) => {
  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `la-publica-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Utility function to read backup file
export const readBackupFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Format d\'arxiu invàlid'));
      }
    };
    reader.onerror = () => reject(new Error('Error al llegir l\'arxiu'));
    reader.readAsText(file);
  });
};