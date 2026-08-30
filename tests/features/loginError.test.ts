import { ApiError } from '@/api/errors';
import { resolveLoginErrorState } from '@/features/auth/utils/loginError';

describe('resolveLoginErrorState', () => {
  it('maps invalid credentials to the expected root copy', () => {
    expect(
      resolveLoginErrorState(
        new ApiError({
          errorKey: 'invalid_credentials',
          message: 'Invalid credentials.',
          statusCode: 401,
        }),
      ),
    ).toEqual({
      rootMessage: 'Invalid email or password.',
    });
  });

  it('maps inactive accounts to the expected root copy', () => {
    expect(
      resolveLoginErrorState(
        new ApiError({
          errorKey: 'inactive',
          message: 'Forbidden.',
          statusCode: 403,
        }),
      ),
    ).toEqual({
      rootMessage: 'Your account is inactive.',
    });
  });

  it('surfaces field validation errors where possible', () => {
    expect(
      resolveLoginErrorState(
        new ApiError({
          errorKey: 'validation_error',
          fieldErrors: {
            email: ['The email field must be a valid email address.'],
            password: ['The password field is required.'],
          },
          message: 'Validation failed.',
          statusCode: 422,
        }),
      ),
    ).toEqual({
      emailMessage: 'The email field must be a valid email address.',
      passwordMessage: 'The password field is required.',
    });
  });

  it('preserves the network error copy', () => {
    expect(
      resolveLoginErrorState(
        new ApiError({
          errorKey: 'network',
          message:
            'Unable to connect to the server. Check your internet connection and try again.',
          retryable: true,
          statusCode: null,
        }),
      ),
    ).toEqual({
      rootMessage:
        'Unable to connect to the server. Check your internet connection and try again.',
    });
  });
});
