import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SECURE_STORE_KEYS } from '@/config/constants';
import {
  clearSessionStorage,
  deleteAccessToken,
  deleteAuthSession,
  deleteSelectedProjectId,
  getAccessToken,
  getAuthSession,
  getSelectedProjectId,
  parseStoredProjectId,
  setAccessToken,
  setAuthSession,
  setSelectedProjectId,
} from '@/services/secureStorage';
import { logger } from '@/services/logger';
import type { AuthSession } from '@/types/auth';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const authSession: AuthSession = {
  accessToken: 'token-1',
  backendRoleNames: ['staff'],
  permissions: ['dashboard.view'],
  projects: [{ id: 42, name: 'Blue Residency' }],
  roles: ['staff'],
  selectedProjectId: 42,
  user: { email: 'staff@bluemarketing.com', id: 7, name: 'Bilal' },
};

function createSessionStorageMock() {
  const state = new Map<string, string>();

  return {
    state,
    storage: {
      getItem: jest.fn((key: string) => state.get(key) ?? null),
      removeItem: jest.fn((key: string) => {
        state.delete(key);
      }),
      setItem: jest.fn((key: string, value: string) => {
        state.set(key, value);
      }),
    },
  };
}

describe('secureStorage', () => {
  const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(
    Platform,
    'OS',
  );
  const originalWindow = globalThis.window;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    if (originalPlatformDescriptor) {
      Object.defineProperty(Platform, 'OS', originalPlatformDescriptor);
    }

    if (originalWindow === undefined) {
      // @ts-expect-error test cleanup
      delete globalThis.window;
    } else {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      });
    }
  });

  it('returns success for token save, read and delete on native', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('token-1');

    await expect(setAccessToken('token-1')).resolves.toEqual({ ok: true });
    await expect(getAccessToken()).resolves.toBe('token-1');
    await expect(deleteAccessToken()).resolves.toEqual({ ok: true });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.accessToken,
      'token-1',
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.accessToken,
    );
  });

  it('persists token, auth session, and selected project in web sessionStorage', async () => {
    const { state, storage } = createSessionStorageMock();

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'web',
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage: storage },
    });

    await expect(setAccessToken('token-1')).resolves.toEqual({ ok: true });
    await expect(setAuthSession(authSession)).resolves.toEqual({ ok: true });
    await expect(setSelectedProjectId(42)).resolves.toEqual({ ok: true });

    await expect(getAccessToken()).resolves.toBe('token-1');
    await expect(getAuthSession()).resolves.toEqual(authSession);
    await expect(getSelectedProjectId()).resolves.toBe(42);

    expect(state.get(SECURE_STORE_KEYS.accessToken)).toBe('token-1');
    expect(state.get(SECURE_STORE_KEYS.authSession)).toBe(
      JSON.stringify(authSession),
    );
    expect(state.get(SECURE_STORE_KEYS.selectedProjectId)).toBe('42');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('removes all web sessionStorage keys on clearSessionStorage', async () => {
    const { state, storage } = createSessionStorageMock();

    state.set(SECURE_STORE_KEYS.accessToken, 'token-1');
    state.set(SECURE_STORE_KEYS.authSession, JSON.stringify(authSession));
    state.set(SECURE_STORE_KEYS.selectedProjectId, '42');

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'web',
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage: storage },
    });

    await expect(clearSessionStorage()).resolves.toEqual({ ok: true });

    expect(storage.removeItem).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.accessToken,
    );
    expect(storage.removeItem).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.authSession,
    );
    expect(storage.removeItem).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.selectedProjectId,
    );
    expect(state.size).toBe(0);
  });

  it('returns typed failure for token persistence without leaking the token value', async () => {
    const warnSpy = jest
      .spyOn(logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .mocked(SecureStore.setItemAsync)
      .mockRejectedValueOnce(new Error('boom'));

    await expect(setAccessToken('token-secret')).resolves.toEqual({
      ok: false,
      operation: 'setAccessToken',
    });

    const [, metadata] = warnSpy.mock.calls[0] ?? [];
    expect(JSON.stringify(metadata)).not.toContain('token-secret');
  });

  it('returns success for selected project save, read and delete on native', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('42');

    await expect(setSelectedProjectId(42)).resolves.toEqual({ ok: true });
    await expect(getSelectedProjectId()).resolves.toBe(42);
    await expect(deleteSelectedProjectId()).resolves.toEqual({ ok: true });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.selectedProjectId,
      '42',
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.selectedProjectId,
    );
  });

  it.each(['1', '42', '1005'])(
    'accepts valid stored project ID string %s',
    (value: string) => {
      expect(parseStoredProjectId(value)).toBe(Number(value));
    },
  );

  it.each(['0', '-1', '1.5', '42abc', 'abc42', 'NaN', 'Infinity', '', '   '])(
    'rejects invalid stored project ID string %s',
    (value: string) => {
      expect(parseStoredProjectId(value)).toBeNull();
    },
  );

  it('returns null for invalid stored project IDs from secure storage', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('42abc');

    await expect(getSelectedProjectId()).resolves.toBeNull();
  });

  it('rejects invalid project IDs before save', async () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);

    await expect(setSelectedProjectId(0)).resolves.toEqual({
      ok: false,
      operation: 'setSelectedProjectId',
    });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('reports whether either native session deletion failed', async () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    jest
      .mocked(SecureStore.deleteItemAsync)
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('boom'));

    await expect(clearSessionStorage()).resolves.toEqual({
      ok: false,
      failedOperations: ['deleteSelectedProjectId'],
    });
  });

  it('handles token read failures without throwing', async () => {
    const warnSpy = jest
      .spyOn(logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .mocked(SecureStore.getItemAsync)
      .mockRejectedValueOnce(new Error('boom'));

    await expect(getAccessToken()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('keeps native auth session persistence on expo-secure-store', async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(JSON.stringify(authSession));

    await expect(setAuthSession(authSession)).resolves.toEqual({ ok: true });
    await expect(getAuthSession()).resolves.toEqual(authSession);
    await expect(deleteAuthSession()).resolves.toEqual({ ok: true });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.authSession,
      JSON.stringify(authSession),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORE_KEYS.authSession,
    );
  });
});
