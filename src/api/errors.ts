import { AxiosError, isAxiosError } from 'axios';
import { z } from 'zod';

import type {
  ApiErrorResponse,
  ApiFieldErrors,
} from '@/api/contracts';

const DEFAULT_ERROR_KEY = 'unexpected_response';
const DEFAULT_MESSAGE = 'The server could not complete the request. Try again.';
const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Check your internet connection and try again.';

const payloadRecordSchema = z.record(z.string(), z.unknown());
const validationErrorsSchema = z.record(z.string(), z.array(z.string()));

export class ApiError extends Error {
  statusCode: number | null;
  errorKey: string;
  fieldErrors: ApiFieldErrors;
  requestId?: string;
  retryable: boolean;

  constructor(options: {
    errorKey: string;
    fieldErrors?: ApiFieldErrors;
    message: string;
    requestId?: string;
    retryable?: boolean;
    statusCode: number | null;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode;
    this.errorKey = options.errorKey;
    this.fieldErrors = options.fieldErrors ?? {};
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  return new ApiError({
    statusCode: null,
    errorKey: DEFAULT_ERROR_KEY,
    message: 'An unexpected error occurred.',
    retryable: false,
  });
}

function normalizeAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.code === AxiosError.ERR_NETWORK) {
    return new ApiError({
      statusCode: null,
      errorKey: 'network',
      message: NETWORK_ERROR_MESSAGE,
      retryable: true,
    });
  }

  if (error.code === AxiosError.ECONNABORTED) {
    return new ApiError({
      statusCode: null,
      errorKey: 'request_timeout',
      message: NETWORK_ERROR_MESSAGE,
      retryable: true,
    });
  }

  const statusCode = error.response?.status ?? null;
  const payload = readApiErrorPayload(error.response?.data);
  const requestId = readHeader(error, 'x-request-id');

  if (!payload) {
    return new ApiError({
      statusCode,
      errorKey: resolveFallbackErrorKey(statusCode),
      message: resolveFallbackMessage(statusCode),
      requestId,
      retryable: isRetryableStatus(statusCode),
    });
  }

  return new ApiError({
    statusCode,
    errorKey: payload.errorKey ?? resolveFallbackErrorKey(statusCode),
    message: payload.message ?? resolveFallbackMessage(statusCode),
    requestId,
    fieldErrors: payload.fieldErrors,
    retryable: isRetryableStatus(statusCode),
  });
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
    case null:
      return 'network';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'server_error';
    default:
      return DEFAULT_ERROR_KEY;
  }
}

function resolveFallbackMessage(statusCode: number | null) {
  if (statusCode === null) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (statusCode >= 500) {
    return DEFAULT_MESSAGE;
  }

  return DEFAULT_MESSAGE;
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
    fieldErrors: validationErrors,
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
