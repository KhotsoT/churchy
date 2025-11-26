import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation, DonationType, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { donationService } from '../services/donationService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState, { EmptyStateIcons } from '../components/ui/EmptyState';
import './DonationsScreen.css';

interface DonationStats {
  total: number;
  monthly: number;
  byType: Record<string, number>;
}

export default function DonationsScreen() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadDonations();
    loadStats();
  }, [dateFilter]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const response = await donationService.getAll({
        startDate: dateFilter.start,
        endDate: dateFilter.end,
      });
      if (response.success && response.data) {
        setDonations(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load donations', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await donationService.getStats({
        startDate: dateFilter.start,
        endDate: dateFilter.end,
      });
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDelete = (donation: Donation) => {
    const donorName = donation.donorId && typeof donation.donorId === 'object'
      ? `${donation.donorId.firstName} ${donation.donorId.lastName}`
      : 'Anonymous';

    showConfirm({
      title: 'Delete Donation',
      message: `Are you sure you want to delete the ${formatCurrency(donation.amount)} donation from ${donorName}?`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await donationService.delete(donation.id);
        if (response.success) {
          showToast('Donation deleted successfully', 'success');
          loadDonations();
          loadStats();
        } else {
          showToast(response.error || 'Failed to delete donation', 'error');
        }
      },
    });
  };

  const getTypeColor = (type: DonationType) => {
    switch (type) {
      case DonationType.TITHE: return 'type-tithe';
      case DonationType.OFFERING: return 'type-offering';
      case DonationType.BUILDING: return 'type-building';
      case DonationType.MISSION: return 'type-mission';
      default: return 'type-other';
    }
  };

  return (
    <div className="donations-screen">
      <div className="page-header">
        <div>
          <h1>Donations</h1>
          <p className="page-subtitle">Track and manage financial contributions</p>
        </div>
        <Button variant="contained" onClick={() => navigate('/donations/new')}>
          + Record Donation
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="stats-row">
          <Card className="stat-mini-card">
            <span className="stat-mini-label">Total (Period)</span>
            <span className="stat-mini-value">{formatCurrency(stats.total)}</span>
          </Card>
          <Card className="stat-mini-card">
            <span className="stat-mini-label">This Month</span>
            <span className="stat-mini-value">{formatCurrency(stats.monthly)}</span>
          </Card>
          <Card className="stat-mini-card">
            <span className="stat-mini-label">Tithes</span>
            <span className="stat-mini-value">{formatCurrency(stats.byType?.tithe || 0)}</span>
          </Card>
          <Card className="stat-mini-card">
            <span className="stat-mini-label">Offerings</span>
            <span className="stat-mini-value">{formatCurrency(stats.byType?.offering || 0)}</span>
          </Card>
        </div>
      )}

      <Card className="filters-card">
        <div className="filters-row">
          <Input
            type="date"
            label="Start Date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
          />
        </div>
      </Card>

      {loading ? (
        <Card>
          <SkeletonTable rows={8} />
        </Card>
      ) : donations.length > 0 ? (
        <Card padding="none">
          <div className="table-container">
            <table className="donations-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={donation.id || index}>
                    <td className="date-cell">{formatDate(donation.date, 'MMM dd, yyyy')}</td>
                    <td className="donor-cell">
                      {donation.donorId && typeof donation.donorId === 'object'
                        ? `${donation.donorId.firstName} ${donation.donorId.lastName}`
                        : 'Anonymous'}
                    </td>
                    <td className="amount-cell">{formatCurrency(donation.amount, donation.currency)}</td>
                    <td>
                      <span className={`type-badge ${getTypeColor(donation.type)}`}>
                        {donation.type}
                      </span>
                    </td>
                    <td className="method-cell">{donation.method}</td>
                    <td className="actions-cell">
                      <Button
                        variant="text"
                        onClick={() => navigate(`/donations/${donation.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => handleDelete(donation)}
                        className="delete-btn"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={EmptyStateIcons.donations}
          title="No donations found"
          description="Start tracking financial contributions by recording your first donation."
          actionLabel="Record First Donation"
          onAction={() => navigate('/donations/new')}
        />
      )}
    </div>
  );
}
