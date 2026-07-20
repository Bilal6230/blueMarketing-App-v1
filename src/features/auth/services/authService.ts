import type { AuthSession, AuthUser, AppRole } from '@/types/auth';

const AUTH_DELAY_MS = 900;

export type SignInInput = {
  email: string;
  password: string;
};

type AccountRecord = {
  accessTokenPrefix: string;
  permissions: string[];
  projects: AuthSession['projects'];
  role: AppRole;
  selectedProjectId: number;
  user: AuthUser;
};

const accountRecords: Record<string, AccountRecord> = {
  'admin@bluemarketing.com': {
    accessTokenPrefix: 'admin-session',
    permissions: [
      'approvals.view',
      'attendance.manage',
      'collections.view',
      'crm.view',
      'dashboard.view',
      'inventory.view',
      'profile.view',
    ],
    projects: [
      { id: 101, name: 'Blue Residency' },
      { id: 102, name: 'Blue Heights' },
    ],
    role: 'administrator',
    selectedProjectId: 101,
    user: {
      email: 'admin@bluemarketing.com',
      id: 1,
      name: 'Sana Ahmed',
    },
  },
  'staff@bluemarketing.com': {
    accessTokenPrefix: 'staff-session',
    permissions: [
      'attendance.manage',
      'crm.view',
      'dashboard.view',
      'profile.view',
    ],
    projects: [
      { id: 101, name: 'Blue Residency' },
      { id: 102, name: 'Blue Heights' },
    ],
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

export async function signIn({
  email,
  password,
}: SignInInput): Promise<AuthSession> {
  await delay(AUTH_DELAY_MS);

  const account = accountRecords[email.trim().toLowerCase()];

  if (!account || password !== 'password123') {
    throw new Error('Incorrect email or password.');
  }

  return {
    accessToken: `${account.accessTokenPrefix}-${Date.now()}`,
    permissions: account.permissions,
    projects: account.projects,
    roles: [account.role],
    selectedProjectId: account.selectedProjectId,
    user: account.user,
  };
}
