import React, { useState, useEffect } from 'react';
import { Volunteer, VolunteerStatus, Member, Group } from '../types';
import { formatDate } from '../utils/helpers';
import { volunteerService } from '../services/volunteerService';
import { memberService } from '../services/memberService';
import { groupService } from '../services/groupService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import './VolunteersScreen.css';

export default function VolunteersScreen() {
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    role: '',
    ministryId: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: VolunteerStatus.ACTIVE,
  });

  useEffect(() => {
    loadVolunteers();
    loadMembers();
    loadGroups();
  }, []);

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const response = await volunteerService.getAll();
      if (response.success && response.data) {
        setVolunteers(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load volunteers', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load volunteers', 'error');
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

  const loadGroups = async () => {
    try {
      const response = await groupService.getAll();
      if (response.success && response.data) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.role) {
      showToast('Please select a member and enter a role', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await volunteerService.create({
        ...formData,
        startDate: new Date(formData.startDate),
      });
      if (response.success) {
        showToast('Volunteer added successfully', 'success');
        setShowForm(false);
        setFormData({
          memberId: '',
          role: '',
          ministryId: '',
          startDate: new Date().toISOString().slice(0, 10),
          status: VolunteerStatus.ACTIVE,
        });
        loadVolunteers();
      } else {
        showToast(response.error || 'Failed to add volunteer', 'error');
      }
    } catch (error: any) {
      showToast('Failed to add volunteer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (volunteer: Volunteer) => {
    const memberName = volunteer.memberId && typeof volunteer.memberId === 'object'
      ? `${volunteer.memberId.firstName} ${volunteer.memberId.lastName}`
      : 'this volunteer';

    showConfirm({
      title: 'Remove Volunteer',
      message: `Are you sure you want to remove ${memberName} from volunteering?`,
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: async () => {
        const response = await volunteerService.delete(volunteer.id);
        if (response.success) {
          showToast('Volunteer removed successfully', 'success');
          loadVolunteers();
        } else {
          showToast(response.error || 'Failed to remove volunteer', 'error');
        }
      },
    });
  };

  const getStatusColor = (status: VolunteerStatus) => {
    switch (status) {
      case VolunteerStatus.ACTIVE: return 'status-active';
      case VolunteerStatus.INACTIVE: return 'status-inactive';
      case VolunteerStatus.ON_LEAVE: return 'status-leave';
      default: return '';
    }
  };

  return (
    <div className="volunteers-screen">
      <div className="page-header">
        <div>
          <h1>Volunteers</h1>
          <p className="page-subtitle">Manage volunteer roles and assignments</p>
        </div>
        <Button variant="contained" onClick={() => setShowForm(true)}>
          + Add Volunteer
        </Button>
      </div>

      {loading ? (
        <SkeletonList items={5} />
      ) : volunteers.length > 0 ? (
        <div className="volunteers-grid">
          {volunteers.map((volunteer, index) => (
            <Card key={volunteer.id || index} className="volunteer-card">
              <div className="volunteer-header">
                <div 
                  className="volunteer-avatar"
                  style={{ 
                    backgroundColor: volunteer.memberId && typeof volunteer.memberId === 'object'
                      ? `hsl(${volunteer.memberId.firstName.charCodeAt(0) * 10}, 60%, 50%)`
                      : '#4A90E2'
                  }}
                >
                  {volunteer.memberId && typeof volunteer.memberId === 'object'
                    ? `${volunteer.memberId.firstName[0]}${volunteer.memberId.lastName[0]}`
                    : '?'}
                </div>
                <div className="volunteer-info">
                  <h3>
                    {volunteer.memberId && typeof volunteer.memberId === 'object'
                      ? `${volunteer.memberId.firstName} ${volunteer.memberId.lastName}`
                      : 'Unknown Member'}
                  </h3>
                  <p className="volunteer-role">{volunteer.role}</p>
                </div>
                <span className={`status-badge ${getStatusColor(volunteer.status)}`}>
                  {volunteer.status}
                </span>
              </div>
              
              <div className="volunteer-details">
                {volunteer.ministryId && typeof volunteer.ministryId === 'object' && (
                  <div className="detail-item">
                    <span className="detail-label">Ministry</span>
                    <span className="detail-value">{volunteer.ministryId.name}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Started</span>
                  <span className="detail-value">{formatDate(volunteer.startDate, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              <div className="volunteer-actions">
                <Button
                  variant="outlined"
                  onClick={() => handleDelete(volunteer)}
                  className="delete-btn"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No volunteers yet"
          description="Add volunteers to manage their roles and schedules."
          actionLabel="Add First Volunteer"
          onAction={() => setShowForm(true)}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Volunteer"
        size="medium"
      >
        <form onSubmit={handleSubmit} className="volunteer-form">
          <Select
            label="Member"
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            options={[
              { value: '', label: 'Select member...' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.firstName} ${m.lastName}`,
              })),
            ]}
            required
          />
          <Input
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Worship Leader, Usher, etc."
            required
          />
          <Select
            label="Ministry/Group (Optional)"
            value={formData.ministryId}
            onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })}
            options={[
              { value: '', label: 'Select ministry...' },
              ...groups.map((g) => ({
                value: g.id,
                label: g.name,
              })),
            ]}
          />
          <Input
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as VolunteerStatus })}
            options={[
              { value: VolunteerStatus.ACTIVE, label: 'Active' },
              { value: VolunteerStatus.INACTIVE, label: 'Inactive' },
              { value: VolunteerStatus.ON_LEAVE, label: 'On Leave' },
            ]}
          />
          <div className="form-actions">
            <Button variant="outlined" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={saving}>
              Add Volunteer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
