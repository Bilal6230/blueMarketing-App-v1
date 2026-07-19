import type { BottomNavigationRoute } from '@/components/navigation/BottomNavigationItem';
import type { AppRole } from '@/types/auth';

export function getBottomNavigationItems(
  _role: AppRole,
): BottomNavigationRoute[] {
  return [
    { href: '/(app)', icon: 'home-outline', key: 'home', label: 'Home' },
    { href: '/(app)/crm', icon: 'people-outline', key: 'crm', label: 'CRM' },
    {
      href: '/(app)/attendance',
      icon: 'time-outline',
      key: 'attendance',
      label: 'Attendance',
    },
    {
      href: '/(app)/profile',
      icon: 'person-outline',
      key: 'profile',
      label: 'Profile',
    },
  ];
}
