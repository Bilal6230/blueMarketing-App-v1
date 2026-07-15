import axios, { AxiosError } from 'axios';

import type { ApiErrorResponse, AppApiError } from '@/api/contracts';

const DEFAULT_ERROR_KEY = 'unexpected_response';

export function normalizeApiError(error: unknown): AppApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return normalizeAxiosError(error);
  }

  return {
    statusCode: null,
    errorKey: DEFAULT_ERROR_KEY,
    message: 'An unexpected error occurred.',
    validationErrors: {},
    retryable: false,
  };
}

function normalizeAxiosError(error: AxiosError<ApiErrorResponse>): AppApiError {
  if (error.code === AxiosError.ERR_NETWORK) {
    return {
      statusCode: null,
      errorKey: 'network_unavailable',
      message: 'Network unavailable. Check your connection and try again.',
      validationErrors: {},
      retryable: true,
    };
  }

  if (error.code === AxiosError.ECONNABORTED) {
    return {
      statusCode: null,
      errorKey: 'request_timeout',
      message: 'The request timed out. Try again.',
      validationErrors: {},
      retryable: true,
    };
  }

  const statusCode = error.response?.status ?? null;
  const payload = error.response?.data;
  const requestId = readHeader(error, 'x-request-id');

  if (!payload) {
    return {
      statusCode,
      errorKey: DEFAULT_ERROR_KEY,
      message: 'Unexpected response from the server.',
      requestId,
      validationErrors: {},
      retryable: isRetryableStatus(statusCode),
    };
  }

  return {
    statusCode,
    errorKey: normalizeErrorKey(payload, statusCode),
    message: payload.message,
    requestId,
    validationErrors: payload.errors ?? {},
    retryable: isRetryableStatus(statusCode),
  };
}

function normalizeErrorKey(payload: ApiErrorResponse, statusCode: number | null) {
  if (payload.error_key?.trim()) {
    return payload.error_key.trim();
  }

  if (payload.error?.trim()) {
    return payload.error.trim();
  }

  switch (statusCode) {
    case 401:
      return 'unauthenticated';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 422:
      return 'validation_error';
    case 429:
      return 'rate_limited';
    case 500:
      return 'server_error';
    default:
      return DEFAULT_ERROR_KEY;
  }
}

function isRetryableStatus(statusCode: number | null) {
  return statusCode === null || statusCode >= 500;
}

function readHeader(error: AxiosError, headerName: string) {
  const headerValue = error.response?.headers?.[headerName];

  if (typeof headerValue === 'string') {
    return headerValue;
  }

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return undefined;
}
