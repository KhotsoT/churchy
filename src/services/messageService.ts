import { apiService } from './api';
import { Message, PaginatedResponse } from '../types';

interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const messageService = {
  async getAll(params?: { type?: string; page?: number; limit?: number }) {
    return apiService.get<PaginatedResponse<Message & { isRead: boolean }>>('/messages', params);
  },

  async getById(id: string) {
    return apiService.get<Message & { isRead: boolean }>(`/messages/${id}`);
  },

  async send(data: {
    recipientIds: string[];
    subject: string;
    body: string;
    type?: string;
    priority?: string;
    isAnnouncement?: boolean;
  }) {
    return apiService.post<Message>('/messages', data);
  },

  async markAsRead(id: string) {
    return apiService.put(`/messages/${id}/read`);
  },

  async delete(id: string) {
    return apiService.delete(`/messages/${id}`);
  },

  async getRecipients() {
    return apiService.get<Recipient[]>('/messages/recipients/list');
  },
};
