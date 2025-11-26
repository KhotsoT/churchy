import { apiService } from './api';
import { storage } from './storage';
import { STORAGE_KEYS } from '../utils/constants';
import { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiService.post<{ user: User; token: string }>('/auth/login', credentials);
    
    if (response.success && response.data) {
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      await storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiService.post<{ user: User; token: string }>('/auth/register', data);
    
    if (response.success && response.data) {
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      await storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async logout(): Promise<void> {
    await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    await storage.remove(STORAGE_KEYS.USER_DATA);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await storage.get(STORAGE_KEYS.USER_DATA);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiService.post<{ token: string }>('/auth/refresh');
  }
}

export const authService = new AuthService();

