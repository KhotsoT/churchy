import { apiService } from './api';
import { Member, PaginatedResponse } from '../types';

export const memberService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    return apiService.get<PaginatedResponse<Member>>('/members', params);
  },

  async getById(id: string) {
    return apiService.get<Member>(`/members/${id}`);
  },

  async create(data: Partial<Member>) {
    return apiService.post<Member>('/members', data);
  },

  async update(id: string, data: Partial<Member>) {
    return apiService.put<Member>(`/members/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/members/${id}`);
  },
};

