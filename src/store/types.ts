export type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

export type SessionPersistenceResult =
  | {
      ok: true;
      selectedProjectId: number | null;
    }
  | {
      ok: false;
      reason: 'tokenPersistenceFailed' | 'selectedProjectPersistenceFailed';
      selectedProjectId: number | null;
    };
