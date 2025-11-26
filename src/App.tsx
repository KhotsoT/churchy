import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useToastStore } from './store/toastStore';
import LoadingScreen from './screens/LoadingScreen';
import ToastContainer from './components/ToastContainer';
import ConfirmDialogProvider from './components/ConfirmDialogProvider';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import MembersScreen from './screens/MembersScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import EventsScreen from './screens/EventsScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import DonationsScreen from './screens/DonationsScreen';
import DonationDetailScreen from './screens/DonationDetailScreen';
import GroupsScreen from './screens/GroupsScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import MessagesScreen from './screens/MessagesScreen';
import PrayerRequestsScreen from './screens/PrayerRequestsScreen';
import VolunteersScreen from './screens/VolunteersScreen';
import ServicePlanningScreen from './screens/ServicePlanningScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MainLayout from './components/MainLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { loadUser } = useAuthStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialogProvider />
      <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterScreen />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordScreen />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="members" element={<MembersScreen />} />
        <Route path="members/:id" element={<MemberDetailScreen />} />
        <Route path="members/new" element={<MemberDetailScreen />} />
        <Route path="attendance" element={<AttendanceScreen />} />
        <Route path="events" element={<EventsScreen />} />
        <Route path="events/:id" element={<EventDetailScreen />} />
        <Route path="events/new" element={<EventDetailScreen />} />
        <Route path="donations" element={<DonationsScreen />} />
        <Route path="donations/new" element={<DonationDetailScreen />} />
        <Route path="donations/:id" element={<DonationDetailScreen />} />
        <Route path="groups" element={<GroupsScreen />} />
        <Route path="groups/:id" element={<GroupDetailScreen />} />
        <Route path="groups/new" element={<GroupDetailScreen />} />
        <Route path="messages" element={<MessagesScreen />} />
        <Route path="prayer" element={<PrayerRequestsScreen />} />
        <Route path="volunteers" element={<VolunteersScreen />} />
        <Route path="service-planning" element={<ServicePlanningScreen />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
    </Routes>
    </>
  );
}

