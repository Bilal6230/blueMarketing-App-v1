import { useAuthStore } from '@/store/authStore';
import * as secureStorage from '@/services/secureStorage';

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

  it('awaits successful session persistence before authenticating', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest
      .spyOn(secureStorage, 'setSelectedProjectId')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({ ok: true, selectedProjectId: 7 });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      selectedProjectId: 7,
      status: 'authenticated',
    });
  });

  it('does not authenticate when token persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({
      ok: false,
      operation: 'setAccessToken',
    });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: false,
      reason: 'tokenPersistenceFailed',
      selectedProjectId: 7,
    });
    expect(useAuthStore.getState().status).toBe('booting');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('does not authenticate when selected project persistence fails', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    jest.spyOn(secureStorage, 'setSelectedProjectId').mockResolvedValue({
      ok: false,
      operation: 'setSelectedProjectId',
    });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: 7,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({
      ok: false,
      reason: 'selectedProjectPersistenceFailed',
      selectedProjectId: 7,
    });
    expect(useAuthStore.getState().status).toBe('booting');
  });

  it('deletes stale project storage when the new session project is null', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    const deleteProjectSpy = jest
      .spyOn(secureStorage, 'deleteSelectedProjectId')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: [],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: null,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({ ok: true, selectedProjectId: null });
    expect(deleteProjectSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().selectedProjectId).toBeNull();
  });

  it('deletes stale project storage when the new session project is invalid', async () => {
    jest.spyOn(secureStorage, 'setAccessToken').mockResolvedValue({ ok: true });
    const deleteProjectSpy = jest
      .spyOn(secureStorage, 'deleteSelectedProjectId')
      .mockResolvedValue({ ok: true });

    const result = await useAuthStore.getState().setSession({
      accessToken: 'token-1',
      permissions: [],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: 99,
      user: { id: 1, name: 'Bilal' },
    });

    expect(result).toEqual({ ok: true, selectedProjectId: null });
    expect(deleteProjectSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().selectedProjectId).toBeNull();
  });

  it('clears session state even when secure deletion fails', async () => {
    const clearSpy = jest
      .spyOn(secureStorage, 'clearSessionStorage')
      .mockResolvedValue({
        ok: false,
        failedOperations: ['deleteAccessToken'],
      });

    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: ['reports.view'],
      projects: [{ id: 1, name: 'HQ' }],
      roles: ['admin'],
      selectedProjectId: 1,
      status: 'authenticated',
      user: { id: 1, name: 'Bilal' },
    });

    await useAuthStore.getState().clearSession();

    expect(clearSpy).toHaveBeenCalled();
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

  it('hydrates stored values without marking the session authenticated', async () => {
    jest.spyOn(secureStorage, 'getAccessToken').mockResolvedValue('token-2');
    jest.spyOn(secureStorage, 'getSelectedProjectId').mockResolvedValue(9);

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'token-2',
      selectedProjectId: 9,
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
});
