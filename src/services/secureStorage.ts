import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SECURE_STORE_KEYS } from '@/config/constants';
import { isAuthSession } from '@/features/auth/utils/authSession';
import { logger } from '@/services/logger';
import type { AuthSession } from '@/types/auth';

export type SecureStorageOperation =
  | 'setAccessToken'
  | 'setAuthSession'
  | 'deleteAuthSession'
  | 'deleteAccessToken'
  | 'setSelectedProjectId'
  | 'deleteSelectedProjectId';

export type SecureStorageResult =
  | { ok: true }
  | {
      ok: false;
      operation: SecureStorageOperation;
    };

export type ClearSessionStorageResult =
  | { ok: true }
  | {
      ok: false;
      failedOperations: SecureStorageOperation[];
    };

const positiveIntegerPattern = /^[1-9]\d*$/;

function getWebStorage() {
  if (Platform.OS !== 'web') {
    return null;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

async function getStoredValue(key: string) {
  if (Platform.OS === 'web') {
    try {
      return getWebStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();

    if (!storage) {
      throw new Error('Web session storage is unavailable.');
    }

    storage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export function parseStoredProjectId(value: string | null) {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!positiveIntegerPattern.test(trimmedValue)) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function isValidProjectId(projectId: number) {
  return Number.isSafeInteger(projectId) && projectId > 0;
}

export async function getAccessToken() {
  try {
    return await getStoredValue(SECURE_STORE_KEYS.accessToken);
  } catch (error) {
    logger.warn('Failed to read access token from secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'getAccessToken',
      error,
    });
    return null;
  }
}

export async function getAuthSession() {
  try {
    const storedValue = await getStoredValue(SECURE_STORE_KEYS.authSession);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    return isAuthSession(parsedValue) ? parsedValue : null;
  } catch (error) {
    logger.warn('Failed to read auth session from secure storage.', {
      key: SECURE_STORE_KEYS.authSession,
      operation: 'getAuthSession',
      error,
    });
    return null;
  }
}

export async function setAccessToken(
  token: string,
): Promise<SecureStorageResult> {
  try {
    await setStoredValue(SECURE_STORE_KEYS.accessToken, token);
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to persist access token to secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'setAccessToken',
      error,
    });
    return {
      ok: false,
      operation: 'setAccessToken',
    };
  }
}

export async function setAuthSession(
  session: AuthSession,
): Promise<SecureStorageResult> {
  try {
    await setStoredValue(SECURE_STORE_KEYS.authSession, JSON.stringify(session));
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to persist auth session to secure storage.', {
      key: SECURE_STORE_KEYS.authSession,
      operation: 'setAuthSession',
      error,
    });
    return {
      ok: false,
      operation: 'setAuthSession',
    };
  }
}

export async function deleteAccessToken(): Promise<SecureStorageResult> {
  try {
    await deleteStoredValue(SECURE_STORE_KEYS.accessToken);
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to delete access token from secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'deleteAccessToken',
      error,
    });
    return {
      ok: false,
      operation: 'deleteAccessToken',
    };
  }
}

export async function deleteAuthSession(): Promise<SecureStorageResult> {
  try {
    await deleteStoredValue(SECURE_STORE_KEYS.authSession);
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to delete auth session from secure storage.', {
      key: SECURE_STORE_KEYS.authSession,
      operation: 'deleteAuthSession',
      error,
    });
    return {
      ok: false,
      operation: 'deleteAuthSession',
    };
  }
}

export async function getSelectedProjectId() {
  try {
    const storedValue = await getStoredValue(SECURE_STORE_KEYS.selectedProjectId);

    return parseStoredProjectId(storedValue);
  } catch (error) {
    logger.warn('Failed to read selected project ID from secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'getSelectedProjectId',
      error,
    });
    return null;
  }
}

export async function setSelectedProjectId(
  projectId: number,
): Promise<SecureStorageResult> {
  if (!isValidProjectId(projectId)) {
    logger.warn(
      'Rejected invalid selected project ID before secure storage persistence.',
      {
        operation: 'setSelectedProjectId',
        projectIdValid: false,
      },
    );
    return {
      ok: false,
      operation: 'setSelectedProjectId',
    };
  }

  try {
    await setStoredValue(SECURE_STORE_KEYS.selectedProjectId, String(projectId));
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to persist selected project ID to secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'setSelectedProjectId',
      error,
    });
    return {
      ok: false,
      operation: 'setSelectedProjectId',
    };
  }
}

export async function deleteSelectedProjectId(): Promise<SecureStorageResult> {
  try {
    await deleteStoredValue(SECURE_STORE_KEYS.selectedProjectId);
    return { ok: true };
  } catch (error) {
    logger.warn('Failed to delete selected project ID from secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'deleteSelectedProjectId',
      error,
    });
    return {
      ok: false,
      operation: 'deleteSelectedProjectId',
    };
  }
}

export async function clearSessionStorage(): Promise<ClearSessionStorageResult> {
  // Expo Web testing currently uses sessionStorage only for temporary frontend sessions.
  // Production web auth should move to a backend-managed secure session, preferably an HttpOnly cookie,
  // and access tokens should not be intentionally persisted in browser localStorage.
  const [tokenResult, projectResult, authSessionResult] = await Promise.all([
    deleteAccessToken(),
    deleteSelectedProjectId(),
    deleteAuthSession(),
  ]);
  const failedOperations = [tokenResult, projectResult, authSessionResult]
    .filter(
      (result): result is Extract<SecureStorageResult, { ok: false }> =>
        !result.ok,
    )
    .map((result) => result.operation);

  if (failedOperations.length === 0) {
    return { ok: true };
  }

  return {
    ok: false,
    failedOperations,
  };
}
