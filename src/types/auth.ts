import type { ProjectSummary } from '@/types/project';

export type AppRole = 'administrator' | 'staff';

export type AuthUser = {
  avatar?: string | null;
  email?: string | null;
  id: number;
  name: string;
};

export type AuthSession = {
  accessToken: string;
  permissions: string[];
  projects: ProjectSummary[];
  roles: AppRole[];
  selectedProjectId: number | null;
  user: AuthUser | null;
};
