import { apiService } from './api';

export const reportService = {
  async getDashboardStats() {
    return apiService.get('/reports/dashboard');
  },

  async getGivingSummary(year?: number) {
    return apiService.get(`/reports/giving-summary${year ? `?year=${year}` : ''}`);
  },

  // Export functions - these return blob URLs for download
  async exportMembers() {
    const response = await fetch('/api/reports/export/members', {
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  async exportDonations(params?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/reports/export/donations${queryParams ? `?${queryParams}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  async exportAttendance(params?: { startDate?: string; endDate?: string; eventId?: string }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/reports/export/attendance${queryParams ? `?${queryParams}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};

async function getToken() {
  const { Preferences } = await import('@capacitor/preferences');
  const { value } = await Preferences.get({ key: 'auth_token' });
  return value;
}


