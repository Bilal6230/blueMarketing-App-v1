import { create } from 'zustand';

import { ApiError } from '@/api/errors';
import {
  getCurrentSession,
  signOut as signOutRequest,
} from '@/features/auth/services/authService';
import type { AppRole, AuthSession, AuthUser } from '@/types/auth';
import type { ProjectSummary } from '@/types/project';
import { logger } from '@/services/logger';
import type {
  AuthStatus,
  ClearSessionResult,
  SessionPersistenceResult,
} from '@/store/types';
import {
  clearSessionStorage,
  deleteAccessToken,
  deleteAuthSession,
  deleteSelectedProjectId,
  getAccessToken,
  getAuthSession,
  getSelectedProjectId,
  setAccessToken,
  setAuthSession,
  setSelectedProjectId,
} from '@/services/secureStorage';

type AuthState = {
  accessToken: string | null;
  permissions: string[];
  projects: ProjectSummary[];
  roles: AppRole[];
  selectedProjectId: number | null;
  status: AuthStatus;
  user: AuthUser | null;
  clearSession: () => Promise<ClearSessionResult>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
  setSelectedProject: (projectId: number) => Promise<void>;
  setSession: (session: AuthSession) => Promise<SessionPersistenceResult>;
};

const initialState = {
  accessToken: null,
  permissions: [],
  projects: [],
  roles: [] as AppRole[],
  selectedProjectId: null,
  status: 'booting' as AuthStatus,
  user: null,
};

function resolveSelectedProjectId(
  projects: ProjectSummary[],
  selectedProjectId: number | null,
) {
  if (selectedProjectId === null) {
    return null;
  }

  return projects.some((project) => project.id === selectedProjectId)
    ? selectedProjectId
    : null;
}

let pendingClearSession: Promise<ClearSessionResult> | null = null;
let pendingLogout: Promise<void> | null = null;

function buildSessionState(
  session: AuthSession,
  persistedProjectId: number | null,
) {
  return {
    accessToken: session.accessToken,
    permissions: session.permissions,
    projects: session.projects,
    roles: session.roles,
    selectedProjectId: persistedProjectId,
    status: 'authenticated' as const,
    user: session.user,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  clearSession: async () => {
    if (!pendingClearSession) {
      pendingClearSession = clearSessionStorage()
        .catch(
          (): ClearSessionResult => ({
            ok: false,
            failedOperations: [],
          }),
        )
        .then((cleanupResult) => {
          set({
            ...initialState,
            status: 'unauthenticated',
          });

          return cleanupResult as ClearSessionResult;
        })
        .finally(() => {
          pendingClearSession = null;
        });
    }

    return pendingClearSession;
  },
  hydrateSession: async () => {
    const [accessToken, selectedProjectId, authSession] = await Promise.all([
      getAccessToken(),
      getSelectedProjectId(),
      getAuthSession(),
    ]);

    if (!accessToken || !authSession) {
      if (accessToken) {
        await deleteAccessToken();
      }
      if (selectedProjectId !== null) {
        await deleteSelectedProjectId();
      }
      await deleteAuthSession();
      set({
        ...initialState,
        status: 'unauthenticated',
      });
      return;
    }

    const persistedProjectId =
      resolveSelectedProjectId(authSession.projects, selectedProjectId) ??
      authSession.selectedProjectId;

    try {
      const refreshedSession = await getCurrentSession(
        accessToken,
        persistedProjectId,
      );
      const persistenceResult = await get().setSession(refreshedSession);

      if (!persistenceResult.ok) {
        logger.warn('Refreshed auth session could not be fully persisted.', {
          reason: persistenceResult.reason,
          source: 'authStore.hydrateSession',
        });

        set(
          buildSessionState(
            refreshedSession,
            persistenceResult.selectedProjectId,
          ),
        );
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        await get().clearSession();
        return;
      }

      if (
        error instanceof ApiError &&
        (error.statusCode === null || error.retryable)
      ) {
        logger.warn('Auth session refresh failed during startup.', {
          errorKey: error.errorKey,
          source: 'authStore.hydrateSession',
          statusCode: error.statusCode,
        });

        set(
          buildSessionState(
            {
              ...authSession,
              accessToken,
              selectedProjectId: persistedProjectId,
            },
            persistedProjectId,
          ),
        );
        return;
      }

      await get().clearSession();
    }
  },
  logout: async () => {
    if (!pendingLogout) {
      pendingLogout = (async () => {
        const accessToken = get().accessToken;

        try {
          await signOutRequest(accessToken);
        } catch (error) {
          logger.warn('Logout request failed; clearing local session anyway.', {
            errorKey: error instanceof ApiError ? error.errorKey : 'unknown',
            source: 'authStore.logout',
            statusCode: error instanceof ApiError ? error.statusCode : null,
          });
        } finally {
          await get().clearSession();
        }
      })().finally(() => {
        pendingLogout = null;
      });
    }

    await pendingLogout;
  },
  setSelectedProject: async (projectId) => {
    const state = get();

    if (!state.projects.some((project) => project.id === projectId)) {
      return;
    }

    const persistenceResult = await setSelectedProjectId(projectId);

    if (persistenceResult.ok) {
      set({ selectedProjectId: projectId });
      await setAuthSession({
        accessToken: state.accessToken ?? '',
        permissions: state.permissions,
        projects: state.projects,
        roles: state.roles,
        selectedProjectId: projectId,
        user: state.user,
      });
    }
  },
  setSession: async (session) => {
    const selectedProjectId = resolveSelectedProjectId(
      session.projects,
      session.selectedProjectId,
    );
    const accessTokenResult = await setAccessToken(session.accessToken);

    if (!accessTokenResult.ok) {
      return {
        ok: false,
        reason: 'tokenPersistenceFailed',
        rollbackRequired: false,
        rollbackSucceeded: null,
        selectedProjectId,
      };
    }

    const projectPersistenceResult =
      selectedProjectId === null
        ? await deleteSelectedProjectId()
        : await setSelectedProjectId(selectedProjectId);

    if (!projectPersistenceResult.ok) {
      const tokenRollbackResult = await deleteAccessToken();

      return {
        ok: false,
        reason: 'selectedProjectPersistenceFailed',
        rollbackRequired: true,
        rollbackSucceeded: tokenRollbackResult.ok,
        selectedProjectId,
      };
    }

    const sessionPersistenceResult = await setAuthSession({
      ...session,
      selectedProjectId,
    });

    if (!sessionPersistenceResult.ok) {
      const [
        tokenRollbackResult,
        projectRollbackResult,
        sessionRollbackResult,
      ] = await Promise.all([
        deleteAccessToken(),
        deleteSelectedProjectId(),
        deleteAuthSession(),
      ]);

      return {
        ok: false,
        reason: 'sessionPersistenceFailed',
        rollbackRequired: true,
        rollbackSucceeded:
          tokenRollbackResult.ok &&
          projectRollbackResult.ok &&
          sessionRollbackResult.ok,
        selectedProjectId,
      };
    }

    set(buildSessionState(session, selectedProjectId));

    return {
      ok: true,
      selectedProjectId,
    };
  },
}));
