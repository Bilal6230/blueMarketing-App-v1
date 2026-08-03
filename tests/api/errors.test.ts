import { AxiosError } from 'axios';

import { ApiError, normalizeApiError } from '@/api/errors';

function createAxiosError(
  data: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    config: { headers: {} } as never,
    data,
    headers,
    status,
    statusText: 'Error',
  });
}

describe('normalizeApiError', () => {
  it('normalizes Laravel validation errors', () => {
    const error = createAxiosError(
      {
        error_key: 'validation_error',
        errors: {
          email: ['The email field is required.'],
          password: ['The password field is required.'],
        },
        message: 'Validation failed.',
        status: false,
      },
      422,
      { 'x-request-id': 'req-1' },
    );

    expect(normalizeApiError(error)).toEqual(
      new ApiError({
        errorKey: 'validation_error',
        fieldErrors: {
          email: ['The email field is required.'],
          password: ['The password field is required.'],
        },
        message: 'Validation failed.',
        requestId: 'req-1',
        retryable: false,
        statusCode: 422,
      }),
    );
  });

  it('normalizes 401 responses', () => {
    const error = createAxiosError(
      {
        error_key: 'invalid_credentials',
        message: 'Invalid credentials.',
        status: false,
      },
      401,
    );

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'invalid_credentials',
      message: 'Invalid credentials.',
      retryable: false,
      statusCode: 401,
    });
  });

  it('normalizes 403, 404, and 409 responses', () => {
    expect(normalizeApiError(createAxiosError(undefined, 403))).toMatchObject({
      errorKey: 'forbidden',
      message: 'The server could not complete the request. Try again.',
      statusCode: 403,
    });
    expect(normalizeApiError(createAxiosError(undefined, 404))).toMatchObject({
      errorKey: 'not_found',
      message: 'The server could not complete the request. Try again.',
      statusCode: 404,
    });
    expect(normalizeApiError(createAxiosError(undefined, 409))).toMatchObject({
      errorKey: 'conflict',
      message: 'The server could not complete the request. Try again.',
      statusCode: 409,
    });
  });

  it('normalizes network failures', () => {
    const error = new AxiosError('Network error', AxiosError.ERR_NETWORK);

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'network',
      message:
        'Unable to connect to the server. Check your internet connection and try again.',
      retryable: true,
      statusCode: null,
    });
  });

  it('normalizes timeout failures as connection failures', () => {
    const error = new AxiosError('Timeout', AxiosError.ECONNABORTED);

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'request_timeout',
      message:
        'Unable to connect to the server. Check your internet connection and try again.',
      retryable: true,
      statusCode: null,
    });
  });

  it('normalizes server failures with the standard copy', () => {
    expect(normalizeApiError(createAxiosError(undefined, 500))).toMatchObject({
      errorKey: 'server_error',
      message: 'The server could not complete the request. Try again.',
      retryable: true,
      statusCode: 500,
    });
  });
});
