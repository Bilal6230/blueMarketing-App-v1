import * as SecureStore from 'expo-secure-store';

import {
  clearSessionStorage,
  deleteAccessToken,
  deleteSelectedProjectId,
  getAccessToken,
  getSelectedProjectId,
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
  });

  it('saves, reads and deletes the access token', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('token-1');

    await setAccessToken('token-1');
    await expect(getAccessToken()).resolves.toBe('token-1');
    await deleteAccessToken();

    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('saves, reads and deletes the selected project ID', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('42');

    await setSelectedProjectId(42);
    await expect(getSelectedProjectId()).resolves.toBe(42);
    await deleteSelectedProjectId();
  });

  it('returns null for invalid stored project IDs', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('abc');

    await expect(getSelectedProjectId()).resolves.toBeNull();
  });

  it('clears both session storage values', async () => {
    await clearSessionStorage();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });

  it('handles storage failures without throwing', async () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('boom'));

    await expect(getAccessToken()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });
});
