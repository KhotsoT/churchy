import { apiService } from './api';
import { Donation, PaginatedResponse } from '../types';

export const donationService = {
  async getAll(params?: { page?: number; limit?: number; donorId?: string; startDate?: string; endDate?: string }) {
    return apiService.get<PaginatedResponse<Donation>>('/donations', params);
  },

  async getById(id: string) {
    return apiService.get<Donation>(`/donations/${id}`);
  },

  async update(id: string, data: Partial<Donation>) {
    return apiService.put<Donation>(`/donations/${id}`, data);
  },

  async create(data: Partial<Donation>) {
    return apiService.post<Donation>('/donations', data);
  },

  async update(id: string, data: Partial<Donation>) {
    return apiService.put<Donation>(`/donations/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/donations/${id}`);
  },

  async getStats(params?: { startDate?: string; endDate?: string }) {
    return apiService.get<{ total: number; monthly: number; byType: Record<string, number> }>('/donations/stats', params);
  },
};

