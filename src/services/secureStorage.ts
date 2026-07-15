import * as SecureStore from 'expo-secure-store';

import { SECURE_STORE_KEYS } from '@/config/constants';
import { logger } from '@/services/logger';

export async function getAccessToken() {
  try {
    return await SecureStore.getItemAsync(SECURE_STORE_KEYS.accessToken);
  } catch (error) {
    logger.warn('Failed to read access token from secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'getAccessToken',
      error,
    });
    return null;
  }
}

export async function setAccessToken(token: string) {
  try {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, token);
  } catch (error) {
    logger.warn('Failed to persist access token to secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'setAccessToken',
      error,
    });
  }
}

export async function deleteAccessToken() {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken);
  } catch (error) {
    logger.warn('Failed to delete access token from secure storage.', {
      key: SECURE_STORE_KEYS.accessToken,
      operation: 'deleteAccessToken',
      error,
    });
  }
}

export async function getSelectedProjectId() {
  try {
    const storedValue = await SecureStore.getItemAsync(SECURE_STORE_KEYS.selectedProjectId);

    if (!storedValue) {
      return null;
    }

    const parsed = Number.parseInt(storedValue, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    logger.warn('Failed to read selected project ID from secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'getSelectedProjectId',
      error,
    });
    return null;
  }
}

export async function setSelectedProjectId(projectId: number) {
  try {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.selectedProjectId, String(projectId));
  } catch (error) {
    logger.warn('Failed to persist selected project ID to secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'setSelectedProjectId',
      error,
    });
  }
}

export async function deleteSelectedProjectId() {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.selectedProjectId);
  } catch (error) {
    logger.warn('Failed to delete selected project ID from secure storage.', {
      key: SECURE_STORE_KEYS.selectedProjectId,
      operation: 'deleteSelectedProjectId',
      error,
    });
  }
}

export async function clearSessionStorage() {
  await Promise.all([deleteAccessToken(), deleteSelectedProjectId()]);
}
