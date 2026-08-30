import { apiClient } from '@/api/client';
import {
  getCurrentSession,
  signIn,
  signOut,
} from '@/features/auth/services/authService';

jest.mock('@/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the expected login request body', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {
          permissions: [],
          projects: [],
          role_names: ['staff'],
          selected_project_id: null,
          token: 'token-1',
          user: {
            avatar: null,
            email: 'staff@bluemarketing.com',
            id: 2,
            name: 'Bilal',
          },
        },
      },
    } as never);

    await signIn({
      email: 'staff@bluemarketing.com',
      password: 'secure-pass',
      project_id: 9,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      'auth/login',
      {
        email: 'staff@bluemarketing.com',
        password: 'secure-pass',
        project_id: 9,
      },
      {
        headers: {
          Authorization: '',
        },
      },
    );
  });

  it('maps a successful login response and preserves the real token', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {
          permissions: ['crm.view', 'dashboard.view'],
          projects: [{ id: 7, name: 'HQ' }],
          role_names: ['administrator'],
          selected_project_id: 7,
          token: 'real-token',
          user: {
            avatar: 'https://cdn.example.com/avatar.png',
            email: 'admin@bluemarketing.com',
            id: 1,
            name: 'Sana Ahmed',
          },
        },
      },
    } as never);

    await expect(
      signIn({
        email: 'admin@bluemarketing.com',
        password: 'secure-pass',
      }),
    ).resolves.toEqual({
      accessToken: 'real-token',
      backendRoleNames: ['administrator'],
      permissions: ['crm.view', 'dashboard.view'],
      projects: [{ id: 7, name: 'HQ' }],
      roles: ['administrator'],
      selectedProjectId: 7,
      user: {
        avatar: 'https://cdn.example.com/avatar.png',
        email: 'admin@bluemarketing.com',
        id: 1,
        name: 'Sana Ahmed',
      },
    });
  });

  it('maps backend admin to administrator', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {
          permissions: [],
          projects: [],
          role_names: ['admin'],
          selected_project_id: null,
          token: 'token-1',
          user: {
            avatar: null,
            email: null,
            id: 1,
            name: 'Admin',
          },
        },
      },
    } as never);

    await expect(
      signIn({ email: 'admin@example.com', password: 'secure-pass' }),
    ).resolves.toMatchObject({
      backendRoleNames: ['admin'],
      roles: ['administrator'],
    });
  });

  it('maps backend superadmin to administrator', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {
          permissions: [],
          projects: [],
          role_names: ['superadmin'],
          selected_project_id: null,
          token: 'token-1',
          user: {
            avatar: null,
            email: null,
            id: 1,
            name: 'Admin',
          },
        },
      },
    } as never);

    await expect(
      signIn({ email: 'admin@example.com', password: 'secure-pass' }),
    ).resolves.toMatchObject({
      backendRoleNames: ['superadmin'],
      roles: ['administrator'],
    });
  });

  it('maps non-admin backend roles to staff', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {
          permissions: ['profile.view'],
          projects: [{ id: 9, name: 'Blue Heights' }],
          role_names: ['sales-executive'],
          selected_project_id: null,
          token: 'token-2',
          user: {
            avatar: null,
            email: 'staff@bluemarketing.com',
            id: 2,
            name: 'Bilal',
          },
        },
      },
    } as never);

    await expect(
      signIn({ email: 'staff@bluemarketing.com', password: 'secure-pass' }),
    ).resolves.toEqual({
      accessToken: 'token-2',
      backendRoleNames: ['sales-executive'],
      permissions: ['profile.view'],
      projects: [{ id: 9, name: 'Blue Heights' }],
      roles: ['staff'],
      selectedProjectId: null,
      user: {
        avatar: null,
        email: 'staff@bluemarketing.com',
        id: 2,
        name: 'Bilal',
      },
    });
  });

  it('refreshes the current session with an explicit token and optional project', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        data: {
          permissions: ['attendance.manage'],
          projects: [{ id: 11, name: 'Field Office' }],
          role_names: ['staff'],
          selected_project_id: 11,
          user: {
            avatar: null,
            email: 'staff@bluemarketing.com',
            id: 2,
            name: 'Bilal',
          },
        },
      },
    } as never);

    await expect(getCurrentSession('persisted-token', 11)).resolves.toEqual({
      accessToken: 'persisted-token',
      backendRoleNames: ['staff'],
      permissions: ['attendance.manage'],
      projects: [{ id: 11, name: 'Field Office' }],
      roles: ['staff'],
      selectedProjectId: 11,
      user: {
        avatar: null,
        email: 'staff@bluemarketing.com',
        id: 2,
        name: 'Bilal',
      },
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('auth/me', {
      headers: {
        Authorization: 'Bearer persisted-token',
      },
      params: {
        project_id: 11,
      },
    });
  });

  it('omits project_id during auth/me when no selected project exists', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        data: {
          permissions: [],
          projects: [],
          role_names: ['staff'],
          selected_project_id: null,
          user: {
            avatar: null,
            email: 'staff@bluemarketing.com',
            id: 2,
            name: 'Bilal',
          },
        },
      },
    } as never);

    await getCurrentSession('persisted-token', null);

    expect(mockedApiClient.get).toHaveBeenCalledWith('auth/me', {
      headers: {
        Authorization: 'Bearer persisted-token',
      },
      params: undefined,
    });
  });

  it('calls backend logout with the current token', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        data: {},
      },
    } as never);

    await signOut('logout-token');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      'auth/logout',
      {},
      {
        headers: {
          Authorization: 'Bearer logout-token',
        },
      },
    );
  });
});
