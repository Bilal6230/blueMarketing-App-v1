import * as secureStorage from '@/services/secureStorage';
import { useAuthStore } from '@/store/authStore';

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
    jest.restoreAllMocks();
  });

  it('starts in the expected initial state', () => {
    expect(useAuthStore.getState().status).toBe('booting');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('awaits successful token and project persistence before authenticating', async () => {
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
      user: { id: 1, name: 'Bilal' },
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

  it('returns typed failure when token persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({
      ok: false,
      operation: 'setAccessToken',
    });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: false,
      reason: 'tokenPersistenceFailed',
      rollbackRequired: false,
      rollbackSucceeded: null,
      selectedProjectId: 7,
    });
    expect(useAuthStore.getState().status).toBe('booting');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('rolls back the token when selected project persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setSelectedProjectId').mockResolvedValue({
      ok: false,
      operation: 'setSelectedProjectId',
    });
    const deleteTokenSpy = jest
      .spyOn(secureStorage, 'deleteAccessToken')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(deleteTokenSpy).toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      reason: 'selectedProjectPersistenceFailed',
      rollbackRequired: true,
      rollbackSucceeded: true,
      selectedProjectId: 7,
    });
    expect(useAuthStore.getState().status).toBe('booting');
  });

  it('reports failed token rollback when selected project persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setSelectedProjectId').mockResolvedValue({
      ok: false,
      operation: 'setSelectedProjectId',
    });
    jest.spyOn(secureStorage, 'deleteAccessToken').mockResolvedValue({
      ok: false,
      operation: 'deleteAccessToken',
    });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: false,
      reason: 'selectedProjectPersistenceFailed',
      rollbackRequired: true,
      rollbackSucceeded: false,
      selectedProjectId: 7,
    });
  });

  it('rolls back the token after null project persistence failure', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'deleteSelectedProjectId').mockResolvedValue({
      ok: false,
      operation: 'deleteSelectedProjectId',
    });
    const deleteTokenSpy = jest
      .spyOn(secureStorage, 'deleteAccessToken')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: [],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: null,
      user: { id: 1, name: 'Bilal' },
    });

    expect(deleteTokenSpy).toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      reason: 'selectedProjectPersistenceFailed',
      rollbackRequired: true,
      rollbackSucceeded: true,
      selectedProjectId: null,
    });
  });

  it('returns cleanup success on logout and always clears in-memory state', async () => {
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
      user: { id: 1, name: 'Bilal' },
    });

    const result = await useAuthStore.getState().clearSession();

    expect(clearSpy).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'unauthenticated',
      user: null,
    });
  });

  it('returns token deletion failure on logout and still clears in-memory state', async () => {
    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: false,
      failedOperations: ['deleteAccessToken'],
    });

    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 1, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 1,
      status: 'authenticated',
      user: { id: 1, name: 'Bilal' },
    });

    const result = await useAuthStore.getState().clearSession();

    expect(result).toEqual({
      ok: false,
      failedOperations: ['deleteAccessToken'],
    });
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('returns project deletion failure on logout', async () => {
    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: false,
      failedOperations: ['deleteSelectedProjectId'],
    });

    const result = await useAuthStore.getState().clearSession();

    expect(result).toEqual({
      ok: false,
      failedOperations: ['deleteSelectedProjectId'],
    });
  });

  it('returns both deletion failures on logout', async () => {
    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: false,
      failedOperations: ['deleteAccessToken', 'deleteSelectedProjectId'],
    });

    const result = await useAuthStore.getState().clearSession();

    expect(result).toEqual({
      ok: false,
      failedOperations: ['deleteAccessToken', 'deleteSelectedProjectId'],
    });
  });

  it('hydrates a stored session as authenticated', async () => {
    jest.spyOn(secureStorage, 'getAccessToken').mockResolvedValue('token-2');
    jest.spyOn(secureStorage, 'getAuthSession').mockResolvedValue({
      accessToken: 'token-2',
      permissions: ['dashboard.view'],
      projects: [{ id: 9, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 9,
      user: { id: 2, name: 'Bilal', email: 'staff@bluemarketing.com' },
    });
    jest.spyOn(secureStorage, 'getSelectedProjectId').mockResolvedValue(9);

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-2',
      roles: ['staff'],
      selectedProjectId: 9,
      status: 'authenticated',
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

  it('rolls back persisted values when auth session persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest
      .spyOn(secureStorage, 'setSelectedProjectId')
      .mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setAuthSession').mockResolvedValue({
      ok: false,
      operation: 'setAuthSession',
    });
    jest.spyOn(secureStorage, 'deleteAccessToken').mockResolvedValue({
      ok: true,
    });
    jest.spyOn(secureStorage, 'deleteSelectedProjectId').mockResolvedValue({
      ok: true,
    });
    jest.spyOn(secureStorage, 'deleteAuthSession').mockResolvedValue({
      ok: true,
    });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: false,
      reason: 'sessionPersistenceFailed',
      rollbackRequired: true,
      rollbackSucceeded: true,
      selectedProjectId: 7,
    });
  });
});
