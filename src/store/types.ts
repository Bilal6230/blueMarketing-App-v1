import type { ClearSessionStorageResult } from '@/services/secureStorage';

export type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

export type ClearSessionResult = ClearSessionStorageResult;

export type SessionPersistenceResult =
  | {
      ok: true;
      selectedProjectId: number | null;
    }
  | {
      ok: false;
      reason: 'tokenPersistenceFailed' | 'selectedProjectPersistenceFailed';
      selectedProjectId: number | null;
      rollbackRequired: boolean;
      rollbackSucceeded: boolean | null;
    };
