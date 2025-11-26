import { storage } from './storage';
import { STORAGE_KEYS, API_BASE_URL } from '../utils/constants';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
  };
  error?: string;
}

export const uploadService = {
  async uploadImage(file: File, type: 'members' | 'events' | 'groups' | 'general' = 'general'): Promise<UploadResponse> {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/uploads/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  },

  async deleteImage(type: string, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);

      const response = await fetch(`${API_BASE_URL}/uploads/${type}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }
  },

  getImageUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${API_BASE_URL}${path}`;
  },
};


