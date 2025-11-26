import React, { useState, useEffect } from 'react';
import { ServicePlan, ServiceItem, ServiceItemType, ServiceRole, Member } from '../types';
import { formatDate } from '../utils/helpers';
import { servicePlanningService } from '../services/servicePlanningService';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import './ServicePlanningScreen.css';

export default function ServicePlanningScreen() {
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().slice(0, 16),
    serviceType: 'Sunday Service',
    title: '',
    notes: '',
  });
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [serviceRoles, setServiceRoles] = useState<ServiceRole[]>([]);

  useEffect(() => {
    loadPlans();
    loadMembers();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await servicePlanningService.getAll();
      if (response.success && response.data) {
        setPlans(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load service plans', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load service plans', 'error');
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

  const addServiceItem = () => {
    setServiceItems([
      ...serviceItems,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: ServiceItemType.SONG,
        title: '',
        order: serviceItems.length + 1,
      },
    ]);
  };

  const updateServiceItem = (id: string, updates: Partial<ServiceItem>) => {
    setServiceItems(serviceItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter((item) => item.id !== id));
  };

  const addServiceRole = () => {
    setServiceRoles([
      ...serviceRoles,
      {
        role: '',
        memberId: '',
      },
    ]);
  };

  const updateServiceRole = (index: number, updates: Partial<ServiceRole>) => {
    setServiceRoles(serviceRoles.map((role, i) => (i === index ? { ...role, ...updates } : role)));
  };

  const removeServiceRole = (index: number) => {
    setServiceRoles(serviceRoles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await servicePlanningService.create({
        ...formData,
        serviceDate: new Date(formData.serviceDate),
        orderOfService: serviceItems,
        assignedRoles: serviceRoles,
      });
      if (response.success) {
        showToast('Service plan created successfully', 'success');
        setShowForm(false);
        setFormData({
          serviceDate: new Date().toISOString().slice(0, 16),
          serviceType: 'Sunday Service',
          title: '',
          notes: '',
        });
        setServiceItems([]);
        setServiceRoles([]);
        loadPlans();
      } else {
        showToast(response.error || 'Failed to create service plan', 'error');
      }
    } catch (error: any) {
      showToast('Failed to create service plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (plan: ServicePlan) => {
    showConfirm({
      title: 'Delete Service Plan',
      message: `Are you sure you want to delete "${plan.title || plan.serviceType}"?`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await servicePlanningService.delete(plan.id);
        if (response.success) {
          showToast('Service plan deleted successfully', 'success');
          loadPlans();
        } else {
          showToast(response.error || 'Failed to delete service plan', 'error');
        }
      },
    });
  };

  const getItemTypeIcon = (type: ServiceItemType) => {
    switch (type) {
      case ServiceItemType.SONG: return '🎵';
      case ServiceItemType.PRAYER: return '🙏';
      case ServiceItemType.SCRIPTURE: return '📖';
      case ServiceItemType.SERMON: return '📢';
      case ServiceItemType.ANNOUNCEMENT: return '📣';
      case ServiceItemType.OFFERING: return '💰';
      default: return '📋';
    }
  };

  return (
    <div className="service-planning-screen">
      <div className="page-header">
        <div>
          <h1>Service Planning</h1>
          <p className="page-subtitle">Plan and organize your worship services</p>
        </div>
        <Button variant="contained" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Service Plan'}
        </Button>
      </div>

      {showForm && (
        <Card className="service-form-card">
          <h3>🎵 Create Service Plan</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <Input
                type="datetime-local"
                label="Service Date & Time"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                required
              />
              <Input
                label="Service Type"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="e.g., Sunday Service, Wednesday Prayer"
              />
            </div>
            <Input
              label="Title (Optional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Easter Sunday Celebration"
            />

            <div className="section">
              <div className="section-header">
                <h4>📋 Order of Service</h4>
                <Button type="button" variant="outlined" onClick={addServiceItem}>
                  + Add Item
                </Button>
              </div>
              {serviceItems.length === 0 ? (
                <p className="empty-hint">Click "Add Item" to build your service order</p>
              ) : (
                serviceItems.map((item, index) => (
                  <div key={item.id} className="service-item-form">
                    <span className="item-number">{index + 1}</span>
                    <Select
                      value={item.type}
                      onChange={(e) => updateServiceItem(item.id, { type: e.target.value as ServiceItemType })}
                      options={[
                        { value: ServiceItemType.SONG, label: '🎵 Song' },
                        { value: ServiceItemType.PRAYER, label: '🙏 Prayer' },
                        { value: ServiceItemType.SCRIPTURE, label: '📖 Scripture' },
                        { value: ServiceItemType.SERMON, label: '📢 Sermon' },
                        { value: ServiceItemType.ANNOUNCEMENT, label: '📣 Announcement' },
                        { value: ServiceItemType.OFFERING, label: '💰 Offering' },
                        { value: ServiceItemType.OTHER, label: '📋 Other' },
                      ]}
                    />
                    <Input
                      value={item.title}
                      onChange={(e) => updateServiceItem(item.id, { title: e.target.value })}
                      placeholder="Item title or details"
                    />
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => removeServiceItem(item.id)}
                      className="remove-btn"
                    >
                      ✕
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="section">
              <div className="section-header">
                <h4>👥 Assigned Roles</h4>
                <Button type="button" variant="outlined" onClick={addServiceRole}>
                  + Add Role
                </Button>
              </div>
              {serviceRoles.length === 0 ? (
                <p className="empty-hint">Click "Add Role" to assign team members</p>
              ) : (
                serviceRoles.map((role, index) => (
                  <div key={index} className="service-role-form">
                    <Input
                      value={role.role}
                      onChange={(e) => updateServiceRole(index, { role: e.target.value })}
                      placeholder="e.g., Worship Leader, Preacher"
                    />
                    <Select
                      value={role.memberId}
                      onChange={(e) => updateServiceRole(index, { memberId: e.target.value })}
                      options={[
                        { value: '', label: 'Select member...' },
                        ...members.map((m) => ({
                          value: m.id,
                          label: `${m.firstName} ${m.lastName}`,
                        })),
                      ]}
                    />
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => removeServiceRole(index)}
                      className="remove-btn"
                    >
                      ✕
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="textarea"
                placeholder="Additional notes for this service..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" variant="contained" className="submit-button" loading={submitting}>
              Create Service Plan
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <SkeletonList items={3} />
      ) : plans.length > 0 ? (
        <div className="service-plans-list">
          {plans.map((plan, index) => (
            <Card key={plan.id || index} className="service-plan-card">
              <div className="service-plan-header">
                <div className="plan-info">
                  <h3 className="plan-title">{plan.title || plan.serviceType}</h3>
                  <p className="service-date">
                    📅 {formatDate(plan.serviceDate, 'EEEE, MMM dd, yyyy • h:mm a')}
                  </p>
                </div>
                <Button
                  variant="text"
                  onClick={() => handleDelete(plan)}
                  className="delete-btn"
                >
                  Delete
                </Button>
              </div>
              
              {plan.orderOfService && plan.orderOfService.length > 0 && (
                <div className="order-of-service">
                  <h4>Order of Service</h4>
                  <ol className="service-items-list">
                    {plan.orderOfService
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <li key={item.id} className="service-item-row">
                          <span className="item-icon">{getItemTypeIcon(item.type)}</span>
                          <span className="item-type">{item.type}</span>
                          <span className="item-title">{item.title}</span>
                          {item.duration && <span className="item-duration">{item.duration} min</span>}
                        </li>
                      ))}
                  </ol>
                </div>
              )}

              {plan.assignedRoles && plan.assignedRoles.length > 0 && (
                <div className="assigned-roles">
                  <h4>Assigned Roles</h4>
                  <div className="roles-list">
                    {plan.assignedRoles.map((role, idx) => (
                      <span key={idx} className="role-badge">
                        {role.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plan.notes && (
                <div className="plan-notes">
                  <p>{plan.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No service plans yet"
          description="Create your first service plan to organize worship services."
          actionLabel="Create Service Plan"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
}
