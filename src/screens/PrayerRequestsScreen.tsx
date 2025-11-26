import React, { useState, useEffect } from 'react';
import { PrayerRequest, PrayerStatus, Member } from '../types';
import { formatDate } from '../utils/helpers';
import { prayerRequestService } from '../services/prayerRequestService';
import { memberService } from '../services/memberService';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import './PrayerRequestsScreen.css';

export default function PrayerRequestsScreen() {
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PrayerStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    isPrivate: false,
  });

  useEffect(() => {
    loadPrayerRequests();
    loadMembers();
  }, [filterStatus]);

  const loadPrayerRequests = async () => {
    setLoading(true);
    try {
      const response = await prayerRequestService.getAll({
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      if (response.success && response.data) {
        setPrayerRequests(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load prayer requests', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load prayer requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await memberService.getAll();
      if (response.success && response.data) {
        setMembers(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a title for your prayer request', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await prayerRequestService.create(formData);
      if (response.success) {
        showToast('Prayer request submitted', 'success');
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          isAnonymous: false,
          isPrivate: false,
        });
        loadPrayerRequests();
      } else {
        showToast(response.error || 'Failed to submit prayer request', 'error');
      }
    } catch (error: any) {
      showToast('Failed to submit prayer request', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (request: PrayerRequest) => {
    showConfirm({
      title: 'Delete Prayer Request',
      message: `Are you sure you want to delete "${request.title}"?`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await prayerRequestService.delete(request.id);
        if (response.success) {
          showToast('Prayer request deleted', 'success');
          loadPrayerRequests();
        } else {
          showToast(response.error || 'Failed to delete prayer request', 'error');
        }
      },
    });
  };

  const handleMarkAnswered = (request: PrayerRequest) => {
    showConfirm({
      title: 'Mark as Answered',
      message: `Praise God! Mark "${request.title}" as answered?`,
      confirmText: 'Mark Answered',
      variant: 'info',
      onConfirm: async () => {
        const response = await prayerRequestService.update(request.id, {
                  status: PrayerStatus.ANSWERED,
        });
        if (response.success) {
          showToast('Prayer request marked as answered! 🙏', 'success');
          loadPrayerRequests();
        } else {
          showToast(response.error || 'Failed to update prayer request', 'error');
        }
      },
    });
  };

  const getStatusColor = (status: PrayerStatus) => {
    switch (status) {
      case PrayerStatus.ACTIVE: return 'status-active';
      case PrayerStatus.ANSWERED: return 'status-answered';
      case PrayerStatus.ARCHIVED: return 'status-closed';
      default: return '';
    }
  };

  return (
    <div className="prayer-requests-screen">
      <div className="page-header">
        <div>
          <h1>Prayer Requests</h1>
          <p className="page-subtitle">Share and support each other in prayer</p>
        </div>
        <Button variant="contained" onClick={() => setShowForm(true)}>
          + Submit Request
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters-row">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PrayerStatus | 'all')}
            options={[
              { value: 'all', label: 'All Requests' },
              { value: PrayerStatus.ACTIVE, label: 'Active' },
              { value: PrayerStatus.ANSWERED, label: 'Answered' },
              { value: PrayerStatus.ARCHIVED, label: 'Archived' },
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonList items={5} />
      ) : prayerRequests.length > 0 ? (
        <div className="prayer-list">
          {prayerRequests.map((request, index) => (
            <Card key={request.id || index} className="prayer-card">
              <div className="prayer-header">
                <div className="prayer-icon">🙏</div>
                <div className="prayer-meta">
                  <div className="prayer-requester">
                    {request.isAnonymous ? 'Anonymous' : 
                      request.requesterId && typeof request.requesterId === 'object'
                        ? `${request.requesterId.firstName} ${request.requesterId.lastName}`
                        : 'Unknown'}
                  </div>
                  <div className="prayer-date">
                    {formatDate(request.createdAt, 'MMM dd, yyyy')}
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(request.status)}`}>
                  {request.status === PrayerStatus.ANSWERED ? '✓ Answered' : request.status}
                </span>
              </div>
              
              <h3 className="prayer-title">{request.title}</h3>
              {request.description && (
                <p className="prayer-description">{request.description}</p>
              )}

              <div className="prayer-actions">
                {request.status === PrayerStatus.ACTIVE && (
                  <Button
                    variant="outlined"
                    onClick={() => handleMarkAnswered(request)}
                    className="answered-btn"
                  >
                    Mark Answered
                  </Button>
                )}
                <Button
                  variant="text"
                  onClick={() => handleDelete(request)}
                  className="delete-btn"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No prayer requests"
          description={filterStatus !== 'all' 
            ? `No ${filterStatus} prayer requests found.`
            : "Share your prayer needs with the church community."}
          actionLabel="Submit Prayer Request"
          onAction={() => setShowForm(true)}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Submit Prayer Request"
        size="medium"
      >
        <form onSubmit={handleSubmit} className="prayer-form">
          <div className="input-wrapper">
            <label className="input-label">Title</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for your prayer request"
              required
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Description (Optional)</label>
            <textarea
              className="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Share more details about your prayer request..."
              rows={4}
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              />
              <span>Submit anonymously</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
              <span>Private (only visible to church leaders)</span>
            </label>
          </div>

          <div className="form-actions">
            <Button variant="outlined" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={saving}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
