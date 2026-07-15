import type { BottomNavigationRoute } from '@/components/navigation/BottomNavigationItem';

export const staffPreviewNavigation: BottomNavigationRoute[] = [
  {
    href: '/(preview)/staff-home',
    icon: 'home-outline',
    key: 'home',
    label: 'Home',
  },
  { href: '/(preview)/crm', icon: 'people-outline', key: 'crm', label: 'CRM' },
  {
    href: '/(preview)/attendance',
    icon: 'time-outline',
    key: 'attendance',
    label: 'Attendance',
  },
  { icon: 'briefcase-outline', key: 'operations', label: 'Operations' },
  { icon: 'ellipsis-horizontal', key: 'more', label: 'More' },
];

export const adminPreviewNavigation: BottomNavigationRoute[] = [
  {
    href: '/(preview)/admin-home',
    icon: 'home-outline',
    key: 'home',
    label: 'Home',
  },
  { href: '/(preview)/crm', icon: 'people-outline', key: 'crm', label: 'CRM' },
  { icon: 'briefcase-outline', key: 'operations', label: 'Operations' },
  { icon: 'checkmark-done-outline', key: 'approvals', label: 'Approvals' },
  { icon: 'ellipsis-horizontal', key: 'more', label: 'More' },
];
