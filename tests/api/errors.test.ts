import { AxiosError } from 'axios';

import { normalizeApiError } from '@/api/errors';

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
  it('normalizes valid error_key responses', () => {
    const error = createAxiosError(
      {
        error_key: 'validation_error',
        message: 'Validation failed.',
        status: false,
      },
      422,
      { 'x-request-id': 'req-1' },
    );

    expect(normalizeApiError(error)).toEqual({
      errorKey: 'validation_error',
      message: 'Validation failed.',
      requestId: 'req-1',
      retryable: false,
      statusCode: 422,
      validationErrors: {},
    });
  });

  it('normalizes valid legacy error responses', () => {
    const error = createAxiosError(
      {
        error: 'forbidden',
        message: 'Forbidden.',
        status: false,
      },
      403,
    );

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'forbidden',
      message: 'Forbidden.',
      retryable: false,
      statusCode: 403,
    });
  });

  it('normalizes validation responses', () => {
    const error = createAxiosError(
      {
        error_key: 'validation_error',
        errors: {
          email: ['The email field is required.'],
        },
        message: 'Validation failed.',
        status: false,
      },
      422,
    );

    expect(normalizeApiError(error)).toMatchObject({
      errorKey: 'validation_error',
      validationErrors: {
        email: ['The email field is required.'],
      },
    });
  });

  it('falls back safely for empty response payloads', () => {
    expect(normalizeApiError(createAxiosError(undefined, 404))).toMatchObject({
      errorKey: 'not_found',
      message: 'Unexpected response from the server.',
      retryable: false,
      statusCode: 404,
    });
  });

  it('falls back safely for plain-text responses', () => {
    expect(normalizeApiError(createAxiosError('forbidden', 403))).toMatchObject(
      {
        errorKey: 'forbidden',
        message: 'Unexpected response from the server.',
        retryable: false,
        statusCode: 403,
      },
    );
  });

  it('falls back safely for HTML responses', () => {
    expect(
      normalizeApiError(createAxiosError('<html>bad</html>', 500)),
    ).toMatchObject({
      errorKey: 'server_error',
      message: 'Unexpected response from the server.',
      retryable: true,
      statusCode: 500,
    });
  });

  it('falls back safely for array responses', () => {
    expect(normalizeApiError(createAxiosError(['bad'], 409))).toMatchObject({
      errorKey: 'conflict',
      message: 'Unexpected response from the server.',
      retryable: false,
      statusCode: 409,
    });
  });

  it('falls back when the response message is null', () => {
    expect(
      normalizeApiError(
        createAxiosError(
          {
            error_key: 'unauthenticated',
            message: null,
            status: false,
          },
          401,
        ),
      ),
    ).toMatchObject({
      errorKey: 'unauthenticated',
      message: 'Unexpected response from the server.',
      retryable: false,
      statusCode: 401,
    });
  });

  it('falls back when the response message is numeric', () => {
    expect(
      normalizeApiError(
        createAxiosError(
          {
            error_key: 'conflict',
            message: 12,
            status: false,
          },
          409,
        ),
      ),
    ).toMatchObject({
      errorKey: 'conflict',
      message: 'Unexpected response from the server.',
      retryable: false,
      statusCode: 409,
    });
  });

  it('drops malformed validation errors safely', () => {
    expect(
      normalizeApiError(
        createAxiosError(
          {
            error_key: 'validation_error',
            errors: {
              email: 'bad',
            },
            message: 'Validation failed.',
            status: false,
          },
          422,
        ),
      ),
    ).toMatchObject({
      errorKey: 'validation_error',
      validationErrors: {},
    });
  });

  it('treats a malformed 502 payload as a retryable server error', () => {
    expect(
      normalizeApiError(
        createAxiosError(
          {
            message: '<html>bad gateway</html>',
          },
          502,
          { 'x-request-id': 'req-502' },
        ),
      ),
    ).toEqual({
      errorKey: 'server_error',
      message: 'Unexpected response from the server.',
      requestId: 'req-502',
      retryable: true,
      statusCode: 502,
      validationErrors: {},
    });
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
});
