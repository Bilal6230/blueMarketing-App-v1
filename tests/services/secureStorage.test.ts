import * as SecureStore from 'expo-secure-store';

import {
  clearSessionStorage,
  deleteAccessToken,
  deleteSelectedProjectId,
  getAccessToken,
  getSelectedProjectId,
  parseStoredProjectId,
  setAccessToken,
  setSelectedProjectId,
} from '@/services/secureStorage';
import { logger } from '@/services/logger';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('returns success for token save, read and delete', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('token-1');

    await expect(setAccessToken('token-1')).resolves.toEqual({ ok: true });
    await expect(getAccessToken()).resolves.toBe('token-1');
    await expect(deleteAccessToken()).resolves.toEqual({ ok: true });
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

  it('returns success for selected project save, read and delete', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('42');

    await expect(setSelectedProjectId(42)).resolves.toEqual({ ok: true });
    await expect(getSelectedProjectId()).resolves.toBe(42);
    await expect(deleteSelectedProjectId()).resolves.toEqual({ ok: true });
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

  it('reports whether either session deletion failed', async () => {
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
});
