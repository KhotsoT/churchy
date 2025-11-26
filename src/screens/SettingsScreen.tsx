import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import { settingsService } from '../services/settingsService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import './SettingsScreen.css';

interface ChurchProfile {
  churchName: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  timezone: string;
  currency: string;
  dateFormat: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [churchProfile, setChurchProfile] = useState<ChurchProfile>({
    churchName: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    timezone: 'America/New_York',
    currency: 'ZAR',
    dateFormat: 'MM/dd/yyyy',
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsService.getChurchSettings();
      if (response.success && response.data) {
        setChurchProfile({
          churchName: response.data.churchName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          website: response.data.website || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
          },
          timezone: response.data.timezone || 'America/New_York',
          currency: response.data.currency || 'USD',
          dateFormat: response.data.dateFormat || 'MM/dd/yyyy',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveChurchProfile = async () => {
    setLoading(true);
    try {
      const response = await settingsService.updateChurchSettings(churchProfile);
      if (response.success) {
        showToast('Church profile updated successfully', 'success');
      } else {
        showToast(response.error || 'Failed to update church profile', 'error');
      }
    } catch (error) {
      showToast('Failed to update church profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserProfile = async () => {
    setLoading(true);
    try {
      const response = await settingsService.updateUserProfile(userProfile);
      if (response.success && response.data) {
        updateUser(response.data);
        showToast('Profile updated successfully', 'success');
      } else {
        showToast(response.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (response.success) {
        showToast('Password changed successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(response.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      variant: 'warning',
      onConfirm: async () => {
        await logout();
        navigate('/login');
      },
    });
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'church', label: 'Church Profile', icon: '⛪' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="settings-screen">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and church settings</p>
        </div>
      </div>

      <div className="settings-layout">
        <Card className="settings-nav">
          <nav className="nav-list">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="nav-footer">
            <Button variant="outlined" onClick={handleLogout} className="logout-btn">
              Sign Out
            </Button>
          </div>
        </Card>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="section-title">My Profile</h2>
              <p className="section-description">Update your personal information</p>
              
              <div className="form-grid">
                <Input
                  label="First Name"
                  value={userProfile.firstName}
                  onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={userProfile.lastName}
                  onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <Button variant="contained" onClick={handleSaveUserProfile} loading={loading}>
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'church' && (
            <Card>
              <h2 className="section-title">Church Profile</h2>
              <p className="section-description">Configure your church's information</p>
              
              <div className="form-section">
                <h3 className="subsection-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-full-width">
                    <Input
                      label="Church Name"
                      value={churchProfile.churchName}
                      onChange={(e) => setChurchProfile({ ...churchProfile, churchName: e.target.value })}
                      placeholder="Enter church name"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={churchProfile.email}
                    onChange={(e) => setChurchProfile({ ...churchProfile, email: e.target.value })}
                    placeholder="church@example.com"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={churchProfile.phone}
                    onChange={(e) => setChurchProfile({ ...churchProfile, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                  <div className="form-full-width">
                    <Input
                      label="Website"
                      value={churchProfile.website}
                      onChange={(e) => setChurchProfile({ ...churchProfile, website: e.target.value })}
                      placeholder="https://yourchurch.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="subsection-title">Address</h3>
                <div className="form-grid">
                  <div className="form-full-width">
                    <Input
                      label="Street Address"
                      value={churchProfile.address.street}
                      onChange={(e) => setChurchProfile({
                        ...churchProfile,
                        address: { ...churchProfile.address, street: e.target.value }
                      })}
                    />
                  </div>
                  <Input
                    label="City"
                    value={churchProfile.address.city}
                    onChange={(e) => setChurchProfile({
                      ...churchProfile,
                      address: { ...churchProfile.address, city: e.target.value }
                    })}
                  />
                  <Input
                    label="State"
                    value={churchProfile.address.state}
                    onChange={(e) => setChurchProfile({
                      ...churchProfile,
                      address: { ...churchProfile.address, state: e.target.value }
                    })}
                  />
                  <Input
                    label="ZIP Code"
                    value={churchProfile.address.zipCode}
                    onChange={(e) => setChurchProfile({
                      ...churchProfile,
                      address: { ...churchProfile.address, zipCode: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button variant="contained" onClick={handleSaveChurchProfile} loading={loading}>
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="section-title">Security</h2>
              <p className="section-description">Manage your password and security settings</p>
              
              <div className="form-section">
                <h3 className="subsection-title">Change Password</h3>
                <div className="password-form">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    helperText="Must be at least 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button variant="contained" onClick={handleChangePassword} loading={loading}>
                  Update Password
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <h2 className="section-title">Preferences</h2>
              <p className="section-description">Customize your experience</p>
              
              <div className="form-grid">
                <Select
                  label="Timezone"
                  value={churchProfile.timezone}
                  onChange={(e) => setChurchProfile({ ...churchProfile, timezone: e.target.value })}
                  options={[
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'America/Chicago', label: 'Central Time (CT)' },
                    { value: 'America/Denver', label: 'Mountain Time (MT)' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
                    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
                  ]}
                />
                <Select
                  label="Currency"
                  value={churchProfile.currency}
                  onChange={(e) => setChurchProfile({ ...churchProfile, currency: e.target.value })}
                  options={[
                    { value: 'ZAR', label: 'South African Rand (R)' },
                    { value: 'USD', label: 'US Dollar ($)' },
                    { value: 'EUR', label: 'Euro (€)' },
                    { value: 'GBP', label: 'British Pound (£)' },
                    { value: 'CAD', label: 'Canadian Dollar (CA$)' },
                    { value: 'AUD', label: 'Australian Dollar (A$)' },
                  ]}
                />
                <Select
                  label="Date Format"
                  value={churchProfile.dateFormat}
                  onChange={(e) => setChurchProfile({ ...churchProfile, dateFormat: e.target.value })}
                  options={[
                    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (12/31/2024)' },
                    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (31/12/2024)' },
                    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2024-12-31)' },
                  ]}
                />
              </div>

              <div className="form-actions">
                <Button variant="contained" onClick={handleSaveChurchProfile} loading={loading}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
