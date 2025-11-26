import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { donationSchema } from '../utils/validation';
import { Donation, DonationType, PaymentMethod, Member } from '../types';
import { donationService } from '../services/donationService';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import './DonationDetailScreen.css';

interface DonationFormData {
  donorId: string;
  amount: number;
  currency: string;
  date: string;
  type: DonationType;
  method: PaymentMethod;
  fund?: string;
  notes?: string;
}

export default function DonationDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [members, setMembers] = useState<Member[]>([]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<DonationFormData>({
    resolver: yupResolver(donationSchema),
    defaultValues: {
      donorId: '',
      amount: 0,
      currency: 'ZAR',
      date: new Date().toISOString().slice(0, 10),
      type: DonationType.TITHE,
      method: PaymentMethod.CASH,
      fund: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadMembers();
    if (id) {
      loadDonation();
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

  const loadDonation = async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const response = await donationService.getById(id);
      if (response.success && response.data) {
        const donation = response.data;
        reset({
          donorId: typeof donation.donorId === 'object' ? donation.donorId.id : donation.donorId,
          amount: donation.amount,
          currency: donation.currency,
          date: new Date(donation.date).toISOString().slice(0, 10),
          type: donation.type,
          method: donation.method,
          fund: donation.fund || '',
          notes: donation.notes || '',
        });
      } else {
        showToast(response.error || 'Failed to load donation', 'error');
        navigate('/donations');
      }
    } catch (error: any) {
      showToast('Failed to load donation', 'error');
      navigate('/donations');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    setLoading(true);
    try {
      const donationData = {
        ...data,
        date: new Date(data.date),
      };

      let response;
      if (id) {
        response = await donationService.update(id, donationData);
      } else {
        response = await donationService.create(donationData);
      }

      if (response.success) {
        showToast(id ? 'Donation updated successfully' : 'Donation recorded successfully', 'success');
        navigate('/donations');
      } else {
        showToast(response.error || 'Failed to save donation', 'error');
      }
    } catch (error: any) {
      showToast('Failed to save donation', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="donation-detail-screen">
        <Card>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading donation...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="donation-detail-screen">
      <div className="page-header">
        <div>
          <h1>{id ? 'Edit Donation' : 'Record New Donation'}</h1>
          <p className="page-subtitle">
            {id ? 'Update donation details' : 'Record a new financial contribution'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="donation-form">
          <div className="form-section">
            <h3 className="section-title">Donor Information</h3>
            <Controller
              control={control}
              name="donorId"
              render={({ field }) => (
                <Select
                  {...field}
                  label="Donor"
                  error={errors.donorId?.message}
                  options={[
                    { value: '', label: 'Select donor...' },
                    ...members.map((m) => ({
                      value: m.id,
                      label: `${m.firstName} ${m.lastName}`,
                    })),
                  ]}
                />
              )}
            />
          </div>

          <div className="form-section">
            <h3 className="section-title">Donation Details</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Amount"
                    error={errors.amount?.message}
                    placeholder="0.00"
                  />
                )}
              />

              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Date"
                    error={errors.date?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Donation Type"
                    error={errors.type?.message}
                    options={[
                      { value: DonationType.TITHE, label: 'Tithe' },
                      { value: DonationType.OFFERING, label: 'Offering' },
                      { value: DonationType.BUILDING, label: 'Building' },
                      { value: DonationType.MISSION, label: 'Mission' },
                      { value: DonationType.OTHER, label: 'Other' },
                    ]}
                  />
                )}
              />

              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Payment Method"
                    error={errors.method?.message}
                    options={[
                      { value: PaymentMethod.CASH, label: 'Cash' },
                      { value: PaymentMethod.CHECK, label: 'Check' },
                      { value: PaymentMethod.CARD, label: 'Card' },
                      { value: PaymentMethod.ONLINE, label: 'Online' },
                      { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
                    ]}
                  />
                )}
              />

              <Controller
                control={control}
                name="fund"
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Fund (Optional)"
                    placeholder="e.g., Building Fund"
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
                  placeholder="Add any notes about this donation..."
                  rows={3}
                />
              )}
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/donations')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
            >
              {id ? 'Update Donation' : 'Record Donation'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
