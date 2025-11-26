import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { eventSchema } from '../utils/validation';
import { Event, EventType } from '../types';
import { eventService } from '../services/eventService';
import { useToastStore } from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import './EventDetailScreen.css';

interface EventFormData {
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  registrationRequired: boolean;
}

export default function EventDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      type: EventType.SERVICE,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: '',
      location: '',
      registrationRequired: false,
    },
  });

  const registrationRequired = watch('registrationRequired');

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const response = await eventService.getById(id);
      if (response.success && response.data) {
        const event = response.data;
        reset({
          title: event.title,
          description: event.description || '',
          type: event.type,
          startDate: new Date(event.startDate).toISOString().slice(0, 16),
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
          location: event.location || '',
          registrationRequired: event.registrationRequired || false,
          capacity: event.capacity || undefined,
        });
      } else {
        showToast(response.error || 'Failed to load event', 'error');
        navigate('/events');
      }
    } catch (error: any) {
      showToast('Failed to load event', 'error');
      navigate('/events');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      let response;
      if (id) {
        response = await eventService.update(id, eventData);
      } else {
        response = await eventService.create(eventData);
      }

      if (response.success) {
        showToast(id ? 'Event updated successfully' : 'Event created successfully', 'success');
        navigate('/events');
      } else {
        showToast(response.error || 'Failed to save event', 'error');
      }
    } catch (error: any) {
      showToast('Failed to save event', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="event-detail-screen">
        <Card>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading event...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="event-detail-screen">
      <div className="page-header">
        <div>
          <h1>{id ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="page-subtitle">
            {id ? 'Update event details' : 'Schedule a new church event'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="event-form">
          <div className="form-section">
            <h3 className="section-title">Event Details</h3>
            <div className="form-grid">
              <div className="form-full-width">
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Event Title"
                      error={errors.title?.message}
                      placeholder="Enter event title"
                    />
                  )}
                />
              </div>

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Event Type"
                    error={errors.type?.message}
                    options={[
                      { value: EventType.SERVICE, label: 'Service' },
                      { value: EventType.MEETING, label: 'Meeting' },
                      { value: EventType.CLASS, label: 'Class' },
                      { value: EventType.SOCIAL, label: 'Social' },
                      { value: EventType.OUTREACH, label: 'Outreach' },
                      { value: EventType.OTHER, label: 'Other' },
                    ]}
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
                    placeholder="Enter event location"
                  />
                )}
              />

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
                        placeholder="Describe the event..."
                        rows={4}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Date & Time</h3>
            <div className="form-grid">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    label="Start Date & Time"
                    error={errors.startDate?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    label="End Date & Time (Optional)"
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Registration Settings</h3>
            <div className="form-grid">
              <div className="checkbox-field">
                <Controller
                  control={control}
                  name="registrationRequired"
                  render={({ field: { value, onChange, ...field } }) => (
                    <label className="checkbox-label">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                      <span>Require registration for this event</span>
                    </label>
                  )}
                />
              </div>

              {registrationRequired && (
                <Controller
                  control={control}
                  name="capacity"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Maximum Capacity"
                      placeholder="Leave empty for unlimited"
                    />
                  )}
                />
              )}
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
            >
              {id ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
