import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { groupSchema } from '../utils/validation';
import { Group, GroupType, Member } from '../types';
import { groupService } from '../services/groupService';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import './GroupDetailScreen.css';

interface GroupFormData {
  name: string;
  description?: string;
  type: GroupType;
  leaderId: string;
  meetingSchedule?: string;
  location?: string;
  isActive: boolean;
}

export default function GroupDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToastStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<GroupFormData>({
    resolver: yupResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      type: GroupType.SMALL_GROUP,
      leaderId: '',
      meetingSchedule: '',
      location: '',
      isActive: true,
    },
  });

  useEffect(() => {
    loadMembers();
    if (id) {
      loadGroup();
    } else {
      setInitialLoading(false);
    }
  }, [id]);

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

  const loadGroup = async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const response = await groupService.getById(id);
      if (response.success && response.data) {
        const group = response.data;
        reset({
          name: group.name,
          description: group.description || '',
          type: group.type,
          leaderId: typeof group.leaderId === 'object' ? group.leaderId.id : group.leaderId || '',
          meetingSchedule: group.meetingSchedule || '',
          location: group.location || '',
          isActive: group.isActive,
        });
        setGroupMembers(
          Array.isArray(group.members)
            ? group.members.map((m: any) => (typeof m === 'object' ? m.id : m))
            : []
        );
      } else {
        showToast(response.error || 'Failed to load group', 'error');
        navigate('/groups');
      }
    } catch (error: any) {
      showToast('Failed to load group', 'error');
      navigate('/groups');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: GroupFormData) => {
    setLoading(true);
    try {
      const groupData = {
        ...data,
        members: groupMembers,
      };

      let response;
      if (id) {
        response = await groupService.update(id, groupData);
      } else {
        response = await groupService.create(groupData);
      }

      if (response.success) {
        showToast(id ? 'Group updated successfully' : 'Group created successfully', 'success');
        navigate('/groups');
      } else {
        showToast(response.error || 'Failed to save group', 'error');
      }
    } catch (error: any) {
      showToast('Failed to save group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setGroupMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (initialLoading) {
    return (
      <div className="group-detail-screen">
        <Card>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading group...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="group-detail-screen">
      <div className="page-header">
        <div>
          <h1>{id ? 'Edit Group' : 'Create New Group'}</h1>
          <p className="page-subtitle">
            {id ? 'Update group details and members' : 'Create a new ministry or small group'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="group-form">
          <div className="form-section">
            <h3 className="section-title">Group Information</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Group Name"
                    error={errors.name?.message}
                    placeholder="Enter group name"
                  />
                )}
              />

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Group Type"
                    error={errors.type?.message}
                    options={[
                      { value: GroupType.SMALL_GROUP, label: 'Small Group' },
                      { value: GroupType.MINISTRY, label: 'Ministry' },
                      { value: GroupType.COMMITTEE, label: 'Committee' },
                      { value: GroupType.CLASS, label: 'Class' },
                      { value: GroupType.OTHER, label: 'Other' },
                    ]}
                  />
                )}
              />

              <Controller
                control={control}
                name="leaderId"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Leader"
                    error={errors.leaderId?.message}
                    options={[
                      { value: '', label: 'Select leader...' },
                      ...members.map((m) => ({
                        value: m.id,
                        label: `${m.firstName} ${m.lastName}`,
                      })),
                    ]}
                  />
                )}
              />

              <div className="checkbox-field">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field: { value, onChange, ...field } }) => (
                    <label className="checkbox-label">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                      <span>Active Group</span>
                    </label>
                  )}
                />
              </div>

              <div className="form-full-width">
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <div className="input-wrapper">
                      <label className="input-label">Description</label>
                      <textarea
                        {...field}
                        className="textarea"
                        placeholder="Describe the group's purpose..."
                        rows={3}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Meeting Details</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="meetingSchedule"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Meeting Schedule"
                    placeholder="e.g., Every Sunday at 10 AM"
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Location"
                    placeholder="Meeting location"
                  />
                )}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Group Members ({groupMembers.length} selected)</h3>
            <div className="members-grid">
              {members.map((member, index) => (
                <label key={member.id || index} className="member-checkbox">
                  <input
                    type="checkbox"
                    checked={groupMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                  />
                  <div className="member-checkbox-content">
                    <div
                      className="member-checkbox-avatar"
                      style={{ backgroundColor: `hsl(${member.firstName.charCodeAt(0) * 10}, 60%, 50%)` }}
                    >
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <span className="member-checkbox-name">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
            >
              {id ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
