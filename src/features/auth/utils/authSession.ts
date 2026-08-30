import type { AuthSession, AppRole } from '@/types/auth';

export function isAppRole(value: unknown): value is AppRole {
  return value === 'administrator' || value === 'staff';
}

export function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    typeof session.accessToken === 'string' &&
    (session.backendRoleNames === undefined ||
      (Array.isArray(session.backendRoleNames) &&
        session.backendRoleNames.every((item) => typeof item === 'string'))) &&
    Array.isArray(session.permissions) &&
    session.permissions.every((item) => typeof item === 'string') &&
    Array.isArray(session.projects) &&
    session.projects.every(
      (project) =>
        project &&
        typeof project.id === 'number' &&
        typeof project.name === 'string',
    ) &&
    Array.isArray(session.roles) &&
    session.roles.every(isAppRole) &&
    (session.selectedProjectId === null ||
      typeof session.selectedProjectId === 'number') &&
    (session.user === null ||
      (typeof session.user === 'object' &&
        (session.user?.avatar === undefined ||
          session.user?.avatar === null ||
          typeof session.user?.avatar === 'string') &&
        typeof session.user?.id === 'number' &&
        typeof session.user?.name === 'string'))
  );
}

export function resolvePrimaryRole(roles: readonly AppRole[]): AppRole {
  return roles.includes('administrator') ? 'administrator' : 'staff';
}
