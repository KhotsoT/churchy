export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://churchy.onrender.com/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  THEME: 'theme',
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  MAIN: {
    DASHBOARD: 'Dashboard',
    MEMBERS: 'Members',
    ATTENDANCE: 'Attendance',
    EVENTS: 'Events',
    DONATIONS: 'Donations',
    GROUPS: 'Groups',
    MESSAGES: 'Messages',
    PRAYER: 'PrayerRequests',
    VOLUNTEERS: 'Volunteers',
    SERVICE_PLANNING: 'ServicePlanning',
    REPORTS: 'Reports',
    SETTINGS: 'Settings',
  },
} as const;

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#7B68EE',
  accent: '#50C878',
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  info: '#3498DB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E1E8ED',
  divider: '#E1E8ED',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

