import { cleanup, fireEvent, waitFor } from '@testing-library/react-native';

import { PremiumLoginScreen } from '@/features/auth';
import { signIn } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockReplace = jest.fn();
const mockSetSession = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/features/auth/services/authService', () => ({
  signIn: jest.fn(),
}));

jest.mock('@/components', () => {
  const actual = jest.requireActual('@/components');
  const { View: MockView } = require('react-native');

  return {
    ...actual,
    Screen: ({
      children,
      testID,
    }: {
      children: React.ReactNode;
      testID?: string;
    }) => <MockView testID={testID}>{children}</MockView>,
  };
});

const mockSignIn = jest.mocked(signIn);

describe('PremiumLoginScreen', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockReset();
    mockSetSession.mockReset();
    mockSignIn.mockReset();
    useAuthStore.setState({
      accessToken: null,
      clearSession: jest.fn(),
      hydrateSession: jest.fn(),
      logout: jest.fn(),
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      setSelectedProject: jest.fn(),
      setSession: mockSetSession,
      status: 'unauthenticated',
      user: null,
    } as never);
  });

  it('renders the production login copy', async () => {
    const screen = await renderWithTheme(<PremiumLoginScreen />);

    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('submits staff credentials and opens the app', async () => {
    mockSignIn.mockResolvedValue({
      accessToken: 'staff-session-token',
      permissions: ['dashboard.view', 'crm.view', 'profile.view'],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['staff'],
      selectedProjectId: 101,
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    });
    mockSetSession.mockResolvedValue({ ok: true, selectedProjectId: 101 });

    const screen = await renderWithTheme(<PremiumLoginScreen />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('name@bluemarketing.com'),
      ).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText('name@bluemarketing.com'),
      'staff@bluemarketing.com',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Enter password'),
      'secure-pass',
    );
    fireEvent.press(screen.getByTestId('login-sign-in-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'staff@bluemarketing.com',
        password: 'secure-pass',
      });
      expect(mockSetSession).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(app)');
    });
  });
});
