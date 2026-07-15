import type { AuthStatus } from '@/store/types';

export function resolveActiveAccessToken(
  status: AuthStatus,
  accessToken: string | null,
) {
  if (status !== 'authenticated') {
    return null;
  }

  return accessToken;
}
