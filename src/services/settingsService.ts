import { apiService } from './api';
import { ChurchSettings, User } from '../types';

export const settingsService = {
  async getChurchSettings() {
    return apiService.get<ChurchSettings>('/settings/church');
  },

  async updateChurchSettings(data: Partial<ChurchSettings>) {
    return apiService.put<ChurchSettings>('/settings/church', data);
  },

  async getUserProfile() {
    return apiService.get<User>('/settings/profile');
  },

  async updateUserProfile(data: { firstName: string; lastName: string; email: string; phone?: string }) {
    return apiService.put<User>('/settings/profile', data);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiService.post('/settings/password', data);
  },
};
