import { apiService } from './api';
import { Group, PaginatedResponse } from '../types';

export const groupService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; type?: string }) {
    return apiService.get<PaginatedResponse<Group>>('/groups', params);
  },

  async getById(id: string) {
    return apiService.get<Group>(`/groups/${id}`);
  },

  async create(data: Partial<Group>) {
    return apiService.post<Group>('/groups', data);
  },

  async update(id: string, data: Partial<Group>) {
    return apiService.put<Group>(`/groups/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/groups/${id}`);
  },

  async addMember(groupId: string, memberId: string) {
    return apiService.post(`/groups/${groupId}/members`, { memberId });
  },

  async removeMember(groupId: string, memberId: string) {
    return apiService.delete(`/groups/${groupId}/members/${memberId}`);
  },
};

