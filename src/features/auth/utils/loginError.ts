import { ApiError } from '@/api/errors';

export type LoginErrorState = {
  emailMessage?: string;
  passwordMessage?: string;
  rootMessage?: string;
};

export function resolveLoginErrorState(error: unknown): LoginErrorState {
  if (!(error instanceof ApiError)) {
    return {
      rootMessage: 'Invalid email or password.',
    };
  }

  const emailMessage = error.fieldErrors.email?.[0];
  const passwordMessage = error.fieldErrors.password?.[0];

  if (emailMessage || passwordMessage) {
    return {
      emailMessage,
      passwordMessage,
    };
  }

  if (error.errorKey === 'invalid_credentials') {
    return {
      rootMessage: 'Invalid email or password.',
    };
  }

  if (error.errorKey === 'forbidden' || error.errorKey === 'inactive') {
    return {
      rootMessage: 'Your account is inactive.',
    };
  }

  return {
    rootMessage: error.message,
  };
}
