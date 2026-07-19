import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { AttendancePrototypeScreen } from '@/features/attendance/screens/AttendancePrototypeScreen';
import { LeadListScreen } from '@/features/crm/screens/LeadListScreen';
import { PremiumLoginScreen } from '@/features/auth';
import { StaffHomeScreen } from '@/features/dashboard/screens/StaffHomeScreen';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ leadId: 'lead-1' }),
  useRouter: () => ({
    back: jest.fn(),
    push: mockPush,
    replace: mockReplace,
  }),
}));

const forbiddenTerms = [
  /preview/i,
  /prototype/i,
  /foundation/i,
  /development only/i,
  /static experience/i,
  /design system showcase/i,
  /no request was sent/i,
  /later sprint/i,
  /not connected/i,
];

describe('visible screen terminology', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'token',
      clearSession: jest.fn().mockResolvedValue({ ok: true }),
      permissions: ['dashboard.view', 'crm.view', 'profile.view'],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['staff'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    } as never);
  });

  it('keeps user-facing screens free of storyboard terminology', async () => {
    const screens = [
      await renderWithTheme(<PremiumLoginScreen />),
      await renderWithTheme(<StaffHomeScreen />),
      await renderWithTheme(<LeadListScreen />),
      await renderWithTheme(<AttendancePrototypeScreen />),
      await renderWithTheme(<ProfileScreen />),
    ];

    for (const screen of screens) {
      for (const term of forbiddenTerms) {
        expect(screen.queryByText(term)).toBeNull();
      }
    }
  });
});
