import { ApiError } from '@/api/errors';
import * as authService from '@/features/auth/services/authService';
import * as secureStorage from '@/services/secureStorage';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/features/auth/services/authService', () => ({
  getCurrentSession: jest.fn(),
  signOut: jest.fn(),
}));

const mockedAuthService = jest.mocked(authService);

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'booting',
      user: null,
    });
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('starts in the expected initial state', () => {
    expect(useAuthStore.getState().status).toBe('booting');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('persists the token and session before authenticating', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({ ok: true });
    jest
      .spyOn(secureStorage, 'setSelectedProjectId')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: { avatar: null, id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: true,
      selectedProjectId: 7,
    });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      selectedProjectId: 7,
      status: 'authenticated',
    });
  });

  it('hydrates startup by refreshing the cached session through auth/me', async () => {
    jest.spyOn(secureStorage, 'getAccessToken').mockResolvedValue('token-2');
    jest.spyOn(secureStorage, 'getAuthSession').mockResolvedValue({
      accessToken: 'token-2',
      permissions: ['dashboard.view'],
      projects: [{ id: 9, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 9,
      user: { avatar: null, id: 2, name: 'Bilal', email: 'staff@blue.com' },
    });
    jest.spyOn(secureStorage, 'getSelectedProjectId').mockResolvedValue(9);
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({ ok: true });
    jest
      .spyOn(secureStorage, 'setSelectedProjectId')
      .mockResolvedValue({ ok: true });
    mockedAuthService.getCurrentSession.mockResolvedValue({
      accessToken: 'token-2',
      permissions: ['dashboard.view', 'crm.view'],
      projects: [{ id: 9, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 9,
      user: { avatar: null, id: 2, name: 'Bilal', email: 'staff@blue.com' },
    });

    await useAuthStore.getState().hydrateSession();

    expect(mockedAuthService.getCurrentSession).toHaveBeenCalledWith(
      'token-2',
      9,
    );
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-2',
      permissions: ['dashboard.view', 'crm.view'],
      selectedProjectId: 9,
      status: 'authenticated',
    });
  });

  it('retains the cached session on temporary startup network failure', async () => {
    jest.spyOn(secureStorage, 'getAccessToken').mockResolvedValue('token-2');
    jest.spyOn(secureStorage, 'getAuthSession').mockResolvedValue({
      accessToken: 'token-2',
      permissions: ['dashboard.view'],
      projects: [{ id: 9, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 9,
      user: { avatar: null, id: 2, name: 'Bilal', email: 'staff@blue.com' },
    });
    jest.spyOn(secureStorage, 'getSelectedProjectId').mockResolvedValue(9);
    mockedAuthService.getCurrentSession.mockRejectedValue(
      new ApiError({
        errorKey: 'network',
        message:
          'Unable to connect to the server. Check your internet connection and try again.',
        retryable: true,
        statusCode: null,
      }),
    );

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-2',
      permissions: ['dashboard.view'],
      selectedProjectId: 9,
      status: 'authenticated',
    });
  });

  it('clears the stored session when the startup token is invalid', async () => {
    jest.spyOn(secureStorage, 'getAccessToken').mockResolvedValue('bad-token');
    jest.spyOn(secureStorage, 'getAuthSession').mockResolvedValue({
      accessToken: 'bad-token',
      permissions: ['dashboard.view'],
      projects: [{ id: 9, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 9,
      user: { avatar: null, id: 2, name: 'Bilal', email: 'staff@blue.com' },
    });
    jest.spyOn(secureStorage, 'getSelectedProjectId').mockResolvedValue(9);
    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: true,
    });
    mockedAuthService.getCurrentSession.mockRejectedValue(
      new ApiError({
        errorKey: 'unauthenticated',
        message: 'Unauthorized.',
        statusCode: 401,
      }),
    );

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      permissions: [],
      selectedProjectId: null,
      status: 'unauthenticated',
    });
  });

  it('guards project selection against unknown project IDs', async () => {
    const setProjectSpy = jest
      .spyOn(secureStorage, 'setSelectedProjectId')
      .mockResolvedValue({ ok: true });

    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: [],
      projects: [{ id: 1, name: 'HQ' }],
      roles: [],
      selectedProjectId: 1,
      status: 'authenticated',
      user: null,
    });

    await useAuthStore.getState().setSelectedProject(3);

    expect(setProjectSpy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().selectedProjectId).toBe(1);
  });

  it('logs out through the backend and then clears local session state', async () => {
    mockedAuthService.signOut.mockResolvedValue(undefined);
    const clearSpy = jest
      .spyOn(secureStorage, 'clearSessionStorage')
      .mockResolvedValue({
        ok: true,
      });

    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 1, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 1,
      status: 'authenticated',
      user: { avatar: null, id: 1, name: 'Bilal' },
    });

    await useAuthStore.getState().logout();

    expect(mockedAuthService.signOut).toHaveBeenCalledWith('token-1');
    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      status: 'unauthenticated',
    });
  });

  it('still clears the local session when backend logout fails', async () => {
    mockedAuthService.signOut.mockRejectedValue(
      new ApiError({
        errorKey: 'server_error',
        message: 'The server could not complete the request. Try again.',
        retryable: true,
        statusCode: 500,
      }),
    );
    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: true,
    });

    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 1, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 1,
      status: 'authenticated',
      user: { avatar: null, id: 1, name: 'Bilal' },
    });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      status: 'unauthenticated',
    });
  });
});
