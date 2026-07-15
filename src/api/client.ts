import { create } from 'axios';

import { normalizeApiError } from '@/api/errors';
import { generateRequestId } from '@/api/requestId';
import {
  getAccessTokenForRequest,
  notifyUnauthorized,
} from '@/api/tokenProvider';
import { API_TIMEOUT_MS } from '@/config/constants';
import { env } from '@/config/env';

export const apiClient = create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessTokenForRequest();
  const requestId = await generateRequestId();

  config.headers.set('X-Request-ID', requestId);

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeApiError(error);

    if (normalized.statusCode === 401) {
      await notifyUnauthorized();
    }

    return Promise.reject(normalized);
  },
);
