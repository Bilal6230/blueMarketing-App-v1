import { create } from 'zustand';

import type { AuthSession, AuthUser } from '@/types/auth';
import type { ProjectSummary } from '@/types/project';
import type { AuthStatus } from '@/store/types';
import {
  clearSessionStorage,
  getAccessToken,
  getSelectedProjectId,
  setAccessToken,
  setSelectedProjectId,
} from '@/services/secureStorage';

type AuthState = {
  accessToken: string | null;
  permissions: string[];
  projects: ProjectSummary[];
  roles: string[];
  selectedProjectId: number | null;
  status: AuthStatus;
  user: AuthUser | null;
  clearSession: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  setSelectedProject: (projectId: number) => Promise<void>;
  setSession: (session: AuthSession) => void;
};

const initialState = {
  accessToken: null,
  permissions: [],
  projects: [],
  roles: [],
  selectedProjectId: null,
  status: 'booting' as AuthStatus,
  user: null,
};

function resolveSelectedProjectId(projects: ProjectSummary[], selectedProjectId: number | null) {
  if (selectedProjectId === null) {
    return null;
  }

  return projects.some((project) => project.id === selectedProjectId) ? selectedProjectId : null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  clearSession: async () => {
    await clearSessionStorage();
    set({
      ...initialState,
      status: 'unauthenticated',
    });
  },
  hydrateSession: async () => {
    const [accessToken, selectedProjectId] = await Promise.all([
      getAccessToken(),
      getSelectedProjectId(),
    ]);

    set((state) => ({
      ...state,
      accessToken,
      selectedProjectId,
      status: 'unauthenticated',
    }));
  },
  setSelectedProject: async (projectId) => {
    const state = get();

    if (!state.projects.some((project) => project.id === projectId)) {
      return;
    }

    await setSelectedProjectId(projectId);
    set({ selectedProjectId: projectId });
  },
  setSession: (session) => {
    const selectedProjectId = resolveSelectedProjectId(session.projects, session.selectedProjectId);

    void setAccessToken(session.accessToken);
    if (selectedProjectId !== null) {
      void setSelectedProjectId(selectedProjectId);
    }

    set({
      accessToken: session.accessToken,
      permissions: session.permissions,
      projects: session.projects,
      roles: session.roles,
      selectedProjectId,
      status: 'authenticated',
      user: session.user,
    });
  },
}));
