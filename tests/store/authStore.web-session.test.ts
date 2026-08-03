import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SECURE_STORE_KEYS } from '@/config/constants';
import * as authService from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import {
  clearSessionStorage,
  setAccessToken,
  setAuthSession,
  setSelectedProjectId,
} from '@/services/secureStorage';
import type { AuthSession } from '@/types/auth';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/features/auth/services/authService', () => ({
  getCurrentSession: jest.fn(),
  signOut: jest.fn(),
}));

const mockedAuthService = jest.mocked(authService);

const authSession: AuthSession = {
  accessToken: 'web-token-1',
  permissions: ['dashboard.view'],
  projects: [
    { id: 7, name: 'Blue Residency' },
    { id: 9, name: 'Blue Heights' },
  ],
  roles: ['staff'],
  selectedProjectId: 7,
  user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal' },
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

describe('authStore web session persistence', () => {
  const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(
    Platform,
    'OS',
  );
  const originalWindow = globalThis.window;

  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'booting',
      user: null,
    });
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockedAuthService.getCurrentSession.mockResolvedValue(authSession);

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'web',
    });
  });

  afterEach(() => {
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

  it('hydrates a stored web session and clears all sessionStorage keys on logout', async () => {
    const { state, storage } = createSessionStorageMock();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage: storage },
    });

    await expect(setAccessToken(authSession.accessToken)).resolves.toEqual({
      ok: true,
    });
    await expect(setAuthSession(authSession)).resolves.toEqual({ ok: true });
    await expect(setSelectedProjectId(9)).resolves.toEqual({ ok: true });

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: authSession.accessToken,
      permissions: authSession.permissions,
      projects: authSession.projects,
      roles: authSession.roles,
      selectedProjectId: 7,
      status: 'authenticated',
      user: authSession.user,
    });
    expect(state.get(SECURE_STORE_KEYS.selectedProjectId)).toBe('7');

    const logoutResult = await useAuthStore.getState().clearSession();

    expect(logoutResult).toEqual({ ok: true });
    expect(state.size).toBe(0);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'unauthenticated',
      user: null,
    });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('clearSessionStorage removes all three web keys directly', async () => {
    const { state, storage } = createSessionStorageMock();

    state.set(SECURE_STORE_KEYS.accessToken, authSession.accessToken);
    state.set(SECURE_STORE_KEYS.authSession, JSON.stringify(authSession));
    state.set(SECURE_STORE_KEYS.selectedProjectId, '7');

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage: storage },
    });

    await expect(clearSessionStorage()).resolves.toEqual({ ok: true });
    expect(state.size).toBe(0);
  });
});
