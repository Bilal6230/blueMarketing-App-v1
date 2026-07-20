import { signIn } from '@/features/auth/services/authService';

describe('authService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns a staff session for valid staff credentials', async () => {
    const promise = signIn({
      email: 'staff@bluemarketing.com',
      password: 'password123',
    });

    await jest.advanceTimersByTimeAsync(900);
    const session = await promise;

    expect(session.roles).toEqual(['staff']);
    expect(session.user?.email).toBe('staff@bluemarketing.com');
  });

  it('returns an administrator session for valid administrator credentials', async () => {
    const promise = signIn({
      email: 'admin@bluemarketing.com',
      password: 'password123',
    });

    await jest.advanceTimersByTimeAsync(900);
    const session = await promise;

    expect(session.roles).toEqual(['administrator']);
    expect(session.user?.email).toBe('admin@bluemarketing.com');
  });

  it('rejects invalid credentials', async () => {
    const promise = signIn({
      email: 'staff@bluemarketing.com',
      password: 'wrongpass',
    });
    const expectation = expect(promise).rejects.toThrow(
      'Incorrect email or password',
    );

    await jest.advanceTimersByTimeAsync(900);
    await expectation;
  });
});
