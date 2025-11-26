import { apiService } from './api';
import { Event, PaginatedResponse } from '../types';

export const eventService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; type?: string }) {
    return apiService.get<PaginatedResponse<Event>>('/events', params);
  },

  async getById(id: string) {
    return apiService.get<Event>(`/events/${id}`);
  },

  async create(data: Partial<Event>) {
    return apiService.post<Event>('/events', data);
  },

  async update(id: string, data: Partial<Event>) {
    return apiService.put<Event>(`/events/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/events/${id}`);
  },
};

