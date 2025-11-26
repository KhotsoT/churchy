import { apiService } from './api';
import { Attendance, PaginatedResponse } from '../types';

export const attendanceService = {
  async getAll(params?: { page?: number; limit?: number; eventId?: string; memberId?: string; date?: string }) {
    return apiService.get<PaginatedResponse<Attendance>>('/attendance', params);
  },

  async create(data: Partial<Attendance>) {
    return apiService.post<Attendance>('/attendance', data);
  },

  async bulkCreate(records: Partial<Attendance>[]) {
    return apiService.post<Attendance[]>('/attendance/bulk', { records });
  },

  async update(id: string, data: Partial<Attendance>) {
    return apiService.put<Attendance>(`/attendance/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/attendance/${id}`);
  },

  async getStats(params?: { startDate?: string; endDate?: string; eventId?: string }) {
    return apiService.get<{ total: number; present: number; absent: number; late: number }>('/attendance/stats', params);
  },
};

