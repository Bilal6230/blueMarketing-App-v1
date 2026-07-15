import { AxiosError } from 'axios';

import { normalizeApiError } from '@/api/errors';

describe('normalizeApiError', () => {
  it('normalizes Laravel validation responses', () => {
    const error = new AxiosError('Validation failed', undefined, undefined, undefined, {
      config: { headers: {} } as never,
      data: {
        error_key: 'validation_error',
        errors: {
          email: ['The email field is required.'],
        },
        message: 'Validation failed.',
        status: false,
      },
      headers: { 'x-request-id': 'req-1' },
      status: 422,
      statusText: 'Unprocessable Entity',
    });

    expect(normalizeApiError(error)).toEqual({
      errorKey: 'validation_error',
      message: 'Validation failed.',
      requestId: 'req-1',
      retryable: false,
      statusCode: 422,
      validationErrors: {
        email: ['The email field is required.'],
      },
    });
  });

  it('normalizes legacy error_key aliases', () => {
    const error = new AxiosError('Forbidden', undefined, undefined, undefined, {
      config: { headers: {} } as never,
      data: {
        error: 'forbidden',
        message: 'Forbidden.',
        status: false,
      },
      headers: {},
      status: 403,
      statusText: 'Forbidden',
    });

    expect(normalizeApiError(error).errorKey).toBe('forbidden');
  });

  it('normalizes network failures', () => {
    const error = new AxiosError('Network error', AxiosError.ERR_NETWORK);

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'network_unavailable',
      retryable: true,
      statusCode: null,
    });
  });

  it('normalizes timeout failures', () => {
    const error = new AxiosError('Timeout', AxiosError.ECONNABORTED);

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'request_timeout',
      retryable: true,
      statusCode: null,
    });
  });

  it('marks 500 responses as retryable server errors', () => {
    const error = new AxiosError('Server error', undefined, undefined, undefined, {
      config: { headers: {} } as never,
      data: {
        message: 'Server exploded.',
        status: false,
      },
      headers: {},
      status: 500,
      statusText: 'Server Error',
    });

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'server_error',
      retryable: true,
      statusCode: 500,
    });
  });
});
