import { create } from 'axios';

import { ApiError, normalizeApiError } from '@/api/errors';
import { generateRequestId } from '@/api/requestId';
import {
  getAccessTokenForRequest,
  notifyUnauthorized,
} from '@/api/tokenProvider';
import { API_TIMEOUT_MS } from '@/config/constants';
import { env } from '@/config/env';

export const apiClient = create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async (config) => {
  const requestId = await generateRequestId();

  config.headers.set('X-Request-ID', requestId);

  if (!config.headers.has('Authorization')) {
    const token = await getAccessTokenForRequest();

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  } else if (config.headers.get('Authorization') === '') {
    config.headers.delete('Authorization');
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeApiError(error);

    if (shouldNotifyUnauthorized(normalized, error)) {
      await notifyUnauthorized();
    }

    return Promise.reject(normalized);
  },
);

function shouldNotifyUnauthorized(error: ApiError, rawError: unknown) {
  if (error.statusCode !== 401) {
    return false;
  }

  if (!(rawError instanceof Error) || !('config' in rawError)) {
    return true;
  }

  const requestConfig = (rawError as { config?: { url?: string } }).config;
  const requestUrl = requestConfig?.url ?? '';

  return !isLoginRequest(requestUrl);
}

function isLoginRequest(requestUrl: string) {
  const normalizedUrl = requestUrl.replace(/^\/+/, '');
  return normalizedUrl === 'auth/login';
}
