import { apiService } from './api';
import { Volunteer, PaginatedResponse } from '../types';

export const volunteerService = {
  async getAll(params?: { page?: number; limit?: number }) {
    return apiService.get<PaginatedResponse<Volunteer>>('/volunteers', params);
  },

  async getById(id: string) {
    return apiService.get<Volunteer>(`/volunteers/${id}`);
  },

  async create(data: Partial<Volunteer>) {
    return apiService.post<Volunteer>('/volunteers', data);
  },

  async update(id: string, data: Partial<Volunteer>) {
    return apiService.put<Volunteer>(`/volunteers/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/volunteers/${id}`);
  },
};

