import { apiService } from './api';
import { PrayerRequest, PaginatedResponse } from '../types';

export const prayerRequestService = {
  async getAll(params?: { page?: number; limit?: number; status?: string }) {
    return apiService.get<PaginatedResponse<PrayerRequest>>('/prayer-requests', params);
  },

  async getById(id: string) {
    return apiService.get<PrayerRequest>(`/prayer-requests/${id}`);
  },

  async create(data: Partial<PrayerRequest>) {
    return apiService.post<PrayerRequest>('/prayer-requests', data);
  },

  async update(id: string, data: Partial<PrayerRequest>) {
    return apiService.put<PrayerRequest>(`/prayer-requests/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/prayer-requests/${id}`);
  },
};

