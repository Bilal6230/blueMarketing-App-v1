import type { ProjectSummary } from '@/types/project';

export type AuthUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type AuthSession = {
  accessToken: string;
  permissions: string[];
  projects: ProjectSummary[];
  roles: string[];
  selectedProjectId: number | null;
  user: AuthUser | null;
};
