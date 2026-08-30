import { act, cleanup, render, waitFor } from '@testing-library/react-native';

import { AuthSessionEffects } from '@/providers/AppProviders';
import { queryClient } from '@/providers/QueryProvider';
import * as secureStorage from '@/services/secureStorage';
import { useAuthStore } from '@/store/authStore';

describe('AppProviders auth cache clearing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    useAuthStore.setState({
      accessToken: 'token-1',
      permissions: ['dashboard.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['staff'],
      selectedProjectId: 7,
      status: 'authenticated',
      user: { avatar: null, id: 2, name: 'Bilal', email: 'staff@blue.com' },
    } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('clears cached protected query data after session clearing without repeated cache clears', async () => {
    const clearSpy = jest.spyOn(queryClient, 'clear');

    jest.spyOn(secureStorage, 'clearSessionStorage').mockResolvedValue({
      ok: true,
    });

    render(<AuthSessionEffects />);

    queryClient.setQueryData(['protected', 'dashboard'], { total: 42 });
    expect(queryClient.getQueryData(['protected', 'dashboard'])).toEqual({
      total: 42,
    });

    await act(async () => {
      await useAuthStore.getState().clearSession();
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData(['protected', 'dashboard']),
      ).toBeUndefined();
    });

    await act(async () => {
      await useAuthStore.getState().clearSession();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
