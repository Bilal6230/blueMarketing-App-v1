import { resolveActiveAccessToken } from '@/store/resolveActiveAccessToken';

describe('resolveActiveAccessToken', () => {
  it('returns the token when authenticated and the token exists', () => {
    expect(resolveActiveAccessToken('authenticated', 'token-1')).toBe(
      'token-1',
    );
  });

  it('returns null when authenticated but token is null', () => {
    expect(resolveActiveAccessToken('authenticated', null)).toBeNull();
  });

  it('returns null when unauthenticated even if a token exists', () => {
    expect(resolveActiveAccessToken('unauthenticated', 'token-1')).toBeNull();
  });

  it('returns null when booting even if a token exists', () => {
    expect(resolveActiveAccessToken('booting', 'token-1')).toBeNull();
  });

  it('removes token availability immediately after logout semantics', () => {
    expect(resolveActiveAccessToken('authenticated', 'token-1')).toBe(
      'token-1',
    );
    expect(resolveActiveAccessToken('unauthenticated', 'token-1')).toBeNull();
  });
});
