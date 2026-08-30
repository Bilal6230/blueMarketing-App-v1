import type { AppRole } from '@/types/auth';

export function mapBackendRole(roleName: string): AppRole {
  const normalizedRole = roleName.trim().toLowerCase();

  if (
    normalizedRole === 'admin' ||
    normalizedRole === 'superadmin' ||
    normalizedRole === 'administrator'
  ) {
    return 'administrator';
  }

  return 'staff';
}

export function mapBackendRoles(roleNames: string[]) {
  return Array.from(new Set(roleNames.map(mapBackendRole)));
}
