import { apiService } from './api';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalDonations: number;
  monthlyDonations: number;
  upcomingEvents: number;
  activeGroups: number;
  recentActivity: Array<{
    type: string;
    message: string;
    time: string | Date;
  }>;
}

export const dashboardService = {
  async getStats() {
    const response = await apiService.get<DashboardStats>('/dashboard/stats');
    if (response.success && response.data) {
      // Convert time strings to Date objects
      response.data.recentActivity = response.data.recentActivity.map((activity) => ({
        ...activity,
        time: typeof activity.time === 'string' ? new Date(activity.time) : activity.time,
      }));
    }
    return response;
  },
};

