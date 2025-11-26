import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { memberSchema } from '../utils/validation';
import { Member, MembershipStatus } from '../types';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import './MemberDetailScreen.css';

interface MemberFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  membershipStatus: MembershipStatus;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
}

export default function MemberDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      membershipStatus: MembershipStatus.VISITOR,
    },
  });

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  const loadMember = async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const response = await memberService.getById(id);
      if (response.success && response.data) {
        const member = response.data;
        reset({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email || '',
          phone: member.phone || '',
          membershipStatus: member.membershipStatus,
          dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: member.gender,
          notes: member.notes || '',
        });
      } else {
        showToast(response.error || 'Failed to load member', 'error');
        navigate('/members');
      }
    } catch (error: any) {
      showToast('Failed to load member', 'error');
      navigate('/members');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setLoading(true);
    try {
      const memberData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      };

      let response;
      if (id) {
        response = await memberService.update(id, memberData);
      } else {
        response = await memberService.create(memberData);
      }

      if (response.success) {
        showToast(id ? 'Member updated successfully' : 'Member created successfully', 'success');
        navigate('/members');
      } else {
        showToast(response.error || 'Failed to save member', 'error');
      }
    } catch (error: any) {
      console.error('Error saving member:', error);
      showToast('Failed to save member', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="member-detail-screen">
        <Card>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading member...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="member-detail-screen">
      <div className="page-header">
        <div>
          <h1>{id ? 'Edit Member' : 'Add New Member'}</h1>
          <p className="page-subtitle">
            {id ? 'Update member information' : 'Add a new member to your church directory'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="member-form">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="First Name"
                    error={errors.firstName?.message}
                    placeholder="Enter first name"
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Last Name"
                    error={errors.lastName?.message}
                    placeholder="Enter last name"
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    error={errors.email?.message}
                    placeholder="email@example.com"
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    label="Phone"
                    error={errors.phone?.message}
                    placeholder="(555) 123-4567"
                  />
                )}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Details</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Date of Birth"
                    error={errors.dateOfBirth?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Gender"
                    error={errors.gender?.message}
                    options={[
                      { value: '', label: 'Select gender...' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                )}
              />

              <Controller
                control={control}
                name="membershipStatus"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Membership Status"
                    error={errors.membershipStatus?.message}
                    options={[
                      { value: MembershipStatus.VISITOR, label: 'Visitor' },
                      { value: MembershipStatus.ACTIVE, label: 'Active' },
                      { value: MembershipStatus.MEMBER, label: 'Member' },
                      { value: MembershipStatus.INACTIVE, label: 'Inactive' },
                    ]}
                  />
                )}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Notes</h3>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <textarea
                  {...field}
                  className="textarea"
                  placeholder="Add any additional notes about this member..."
                  rows={4}
                />
              )}
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/members')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
            >
              {id ? 'Update Member' : 'Create Member'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
