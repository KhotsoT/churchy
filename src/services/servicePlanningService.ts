import { apiService } from './api';
import { ServicePlan, PaginatedResponse } from '../types';

export const servicePlanningService = {
  async getAll(params?: { page?: number; limit?: number }) {
    return apiService.get<PaginatedResponse<ServicePlan>>('/service-planning', params);
  },

  async getById(id: string) {
    return apiService.get<ServicePlan>(`/service-planning/${id}`);
  },

  async create(data: Partial<ServicePlan>) {
    return apiService.post<ServicePlan>('/service-planning', data);
  },

  async update(id: string, data: Partial<ServicePlan>) {
    return apiService.put<ServicePlan>(`/service-planning/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/service-planning/${id}`);
  },
};

