import apiClient from './client';

export interface UploadResponse {
  success: boolean;
  data: {
    filePath: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
  message: string;
}

export const uploadFile = async (formData: FormData): Promise<UploadResponse> => {
  const response = await apiClient.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteFile = async (filePath: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete('/uploads', {
    data: { filePath }
  });
  return response.data;
};