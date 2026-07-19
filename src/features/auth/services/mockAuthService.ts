import type { AuthSession, AuthUser, AppRole } from '@/types/auth';

const AUTH_DELAY_MS = 900;

type LoginInput = {
  email: string;
  password: string;
};

type MockAccount = {
  accessToken: string;
  permissions: string[];
  projects: AuthSession['projects'];
  role: AppRole;
  selectedProjectId: number;
  user: AuthUser;
};

const mockAccounts: Record<string, MockAccount> = {
  'admin@bluemarketing.com': {
    accessToken: 'temp-admin-token',
    permissions: [
      'attendance.manage',
      'crm.view',
      'dashboard.view',
      'profile.view',
    ],
    projects: [{ id: 101, name: 'Blue Residency' }],
    role: 'administrator',
    selectedProjectId: 101,
    user: {
      email: 'admin@bluemarketing.com',
      id: 1,
      name: 'Sana Ahmed',
    },
  },
  'staff@bluemarketing.com': {
    accessToken: 'temp-staff-token',
    permissions: [
      'attendance.manage',
      'crm.view',
      'dashboard.view',
      'profile.view',
    ],
    projects: [{ id: 101, name: 'Blue Residency' }],
    role: 'staff',
    selectedProjectId: 101,
    user: {
      email: 'staff@bluemarketing.com',
      id: 2,
      name: 'Bilal Iqbal',
    },
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signInWithMockCredentials({
  email,
  password,
}: LoginInput): Promise<AuthSession> {
  await delay(AUTH_DELAY_MS);

  const account = mockAccounts[email.trim().toLowerCase()];

  if (!account || password !== 'password123') {
    throw new Error('Incorrect email or password');
  }

  return {
    accessToken: `${account.accessToken}-${Date.now()}`,
    permissions: account.permissions,
    projects: account.projects,
    roles: [account.role],
    selectedProjectId: account.selectedProjectId,
    user: account.user,
  };
}
