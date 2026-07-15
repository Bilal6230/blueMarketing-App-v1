import { sanitizeMetadata } from '@/services/logger';

describe('sanitizeMetadata', () => {
  it('redacts sensitive keys', () => {
    expect(
      sanitizeMetadata({
        access_token: 'secret-token',
        safe: 'value',
      }),
    ).toEqual({
      access_token: '[REDACTED]',
      safe: 'value',
    });
  });

  it('redacts nested sensitive values', () => {
    expect(
      sanitizeMetadata({
        nested: {
          phone: '12345',
        },
      }),
    ).toEqual({
      nested: {
        phone: '[REDACTED]',
      },
    });
  });

  it('retains safe metadata', () => {
    expect(
      sanitizeMetadata({
        module: 'auth',
        retryable: true,
      }),
    ).toEqual({
      module: 'auth',
      retryable: true,
    });
  });
});
