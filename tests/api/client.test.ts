import { AxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { registerTokenProvider, registerUnauthorizedHandler } from '@/api/tokenProvider';

function createUnauthorizedError(url: string) {
  return new AxiosError('Unauthorized', undefined, { url } as never, undefined, {
    config: { url } as never,
    data: {
      error_key: 'unauthenticated',
      message: 'Unauthorized.',
      status: false,
    },
    headers: {},
    status: 401,
    statusText: 'Unauthorized',
  });
}

describe('apiClient unauthorized handling', () => {
  beforeEach(() => {
    registerTokenProvider(() => 'token-1');
  });

  it('clears the session for protected 401 responses', async () => {
    const unauthorizedHandler = jest.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);
    apiClient.defaults.adapter = async () => {
      throw createUnauthorizedError('auth/me');
    };

    await expect(apiClient.get('auth/me')).rejects.toMatchObject({
      errorKey: 'unauthenticated',
      statusCode: 401,
    });

    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it('does not trigger global logout for auth/login 401 responses', async () => {
    const unauthorizedHandler = jest.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);
    apiClient.defaults.adapter = async () => {
      throw createUnauthorizedError('auth/login');
    };

    await expect(
      apiClient.post(
        'auth/login',
        { email: 'staff@bluemarketing.com', password: 'wrong-pass' },
        {
          headers: {
            Authorization: '',
          },
        },
      ),
    ).rejects.toMatchObject({
      errorKey: 'unauthenticated',
      statusCode: 401,
    });

    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });
});
