import { AxiosError, isAxiosError } from 'axios';
import { z } from 'zod';

import type { ApiErrorResponse, AppApiError } from '@/api/contracts';

const DEFAULT_ERROR_KEY = 'unexpected_response';
const DEFAULT_MESSAGE = 'Unexpected response from the server.';

const payloadRecordSchema = z.record(z.string(), z.unknown());
const validationErrorsSchema = z.record(z.string(), z.array(z.string()));

export function normalizeApiError(error: unknown): AppApiError {
  if (isAxiosError(error)) {
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
  const payload = readApiErrorPayload(error.response?.data);
  const requestId = readHeader(error, 'x-request-id');

  if (!payload) {
    return {
      statusCode,
      errorKey: resolveFallbackErrorKey(statusCode),
      message: DEFAULT_MESSAGE,
      requestId,
      validationErrors: {},
      retryable: isRetryableStatus(statusCode),
    };
  }

  return {
    statusCode,
    errorKey: payload.errorKey ?? resolveFallbackErrorKey(statusCode),
    message: payload.message ?? DEFAULT_MESSAGE,
    requestId,
    validationErrors: payload.validationErrors,
    retryable: isRetryableStatus(statusCode),
  };
}

function resolveFallbackErrorKey(statusCode: number | null) {
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
    case 502:
    case 503:
    case 504:
      return 'server_error';
    default:
      return DEFAULT_ERROR_KEY;
  }
}

function isRetryableStatus(statusCode: number | null) {
  if (statusCode === null) {
    return true;
  }

  return statusCode >= 500;
}

function readApiErrorPayload(payload: unknown) {
  const parsedRecord = payloadRecordSchema.safeParse(payload);

  if (!parsedRecord.success) {
    return null;
  }

  const record = parsedRecord.data;
  const message = sanitizeMessage(record.message);
  const errorKey =
    sanitizeString(record.error_key) ?? sanitizeString(record.error);
  const validationErrors = readValidationErrors(record.errors);

  if (!message && !errorKey && Object.keys(validationErrors).length === 0) {
    return null;
  }

  return {
    errorKey,
    message,
    validationErrors,
  };
}

function readValidationErrors(value: unknown) {
  const parsedValidationErrors = validationErrorsSchema.safeParse(value);
  return parsedValidationErrors.success ? parsedValidationErrors.data : {};
}

function sanitizeString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function sanitizeMessage(value: unknown) {
  const sanitizedValue = sanitizeString(value);

  if (!sanitizedValue) {
    return null;
  }

  if (/<\/?[a-z][\s\S]*>/i.test(sanitizedValue)) {
    return null;
  }

  return sanitizedValue;
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
