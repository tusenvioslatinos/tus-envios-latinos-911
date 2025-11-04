import { ThemeMode } from '@/types';

const lightColors = {
  primary: '#0066CC',
  primaryDark: '#004999',
  primaryLight: '#3385D6',
  secondary: '#FF6B35',
  secondaryLight: '#FF8F66',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  gradientStart: '#0066CC',
  gradientEnd: '#004999',
};

const darkColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  secondary: '#FF6B35',
  secondaryLight: '#FF8F66',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  
  border: '#334155',
  borderLight: '#475569',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  gradientStart: '#3B82F6',
  gradientEnd: '#2563EB',
};

export const getColors = (theme: ThemeMode) => {
  return theme === 'dark' ? darkColors : lightColors;
};

export default lightColors;
