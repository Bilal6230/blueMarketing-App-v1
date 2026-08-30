import type { AppRole } from '@/types/auth';

function hasPermission(permissions: readonly string[], permission: string) {
  return permissions.includes(permission);
}

export function canReadLabourAttendance(
  permissions: readonly string[],
) {
  return (
    hasPermission(permissions, 'attendance.manage') ||
    hasPermission(permissions, 'read attendance') ||
    hasPermission(permissions, 'read labour')
  );
}

export function canMarkLabourAttendance(
  permissions: readonly string[],
) {
  return (
    hasPermission(permissions, 'attendance.manage') ||
    hasPermission(permissions, 'create attendance') ||
    hasPermission(permissions, 'create labour')
  );
}

export function canUpdateSavedLabourAttendance(
  permissions: readonly string[],
  roles: readonly AppRole[],
) {
  return (
    roles.includes('administrator') ||
    hasPermission(permissions, 'attendance.manage') ||
    hasPermission(permissions, 'update attendance') ||
    hasPermission(permissions, 'update labour')
  );
}
