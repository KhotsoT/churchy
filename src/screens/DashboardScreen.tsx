import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { formatCurrency, formatDate } from '../utils/helpers';
import { dashboardService } from '../services/dashboardService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonStats, SkeletonCard } from '../components/ui/Skeleton';
import './DashboardScreen.css';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalDonations: number;
  monthlyDonations: number;
  upcomingEvents: number;
  activeGroups: number;
  recentActivity: any[];
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    upcomingEvents: 0,
    activeGroups: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        showToast(response.error || 'Failed to load dashboard', 'error');
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <div className="welcome-section">
          <span className="welcome-greeting">{getTimeOfDay()},</span>
          <h1 className="welcome-name">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="welcome-subtitle">Here's what's happening at your church today.</p>
        </div>
        <div className="user-avatar" style={{ backgroundColor: user ? `hsl(${user.firstName.charCodeAt(0) * 10}, 60%, 50%)` : '#4A90E2' }}>
          {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
        </div>
      </div>

      {loading ? (
        <>
          <SkeletonStats />
          <div className="dashboard-row">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          <div className="stats-grid">
            <Card className="stat-card stat-card-primary" onClick={() => navigate('/members')}>
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalMembers}</span>
                <span className="stat-label">Total Members</span>
              </div>
              <div className="stat-trend stat-trend-up">
                <span className="stat-secondary">{stats.activeMembers} active</span>
              </div>
            </Card>

            <Card className="stat-card stat-card-success" onClick={() => navigate('/donations')}>
              <div className="stat-icon">
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>R</span>
              </div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(stats.monthlyDonations)}</span>
                <span className="stat-label">This Month</span>
              </div>
              <div className="stat-trend">
                <span className="stat-secondary">{formatCurrency(stats.totalDonations)} total</span>
              </div>
            </Card>

            <Card className="stat-card stat-card-accent" onClick={() => navigate('/events')}>
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.upcomingEvents}</span>
                <span className="stat-label">Upcoming Events</span>
              </div>
            </Card>

            <Card className="stat-card stat-card-secondary" onClick={() => navigate('/groups')}>
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.activeGroups}</span>
                <span className="stat-label">Active Groups</span>
              </div>
            </Card>
          </div>

          <div className="dashboard-row">
            <Card className="quick-actions-card">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => navigate('/members/new')}>
                  <div className="quick-action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                  <span>Add Member</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/events/new')}>
                  <div className="quick-action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                  </div>
                  <span>Create Event</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/donations/new')}>
                  <div className="quick-action-icon">
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>R</span>
                  </div>
                  <span>Record Donation</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/attendance')}>
                  <div className="quick-action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <span>Take Attendance</span>
                </button>
              </div>
            </Card>

            <Card className="activity-card">
              <h3 className="section-title">Recent Activity</h3>
              <div className="activity-list">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon activity-icon-${activity.type}`}>
                        {activity.type === 'member' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        ) : (
                          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>R</span>
                        )}
                      </div>
                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <span className="activity-time">
                          {formatDate(activity.time, 'MMM dd, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
