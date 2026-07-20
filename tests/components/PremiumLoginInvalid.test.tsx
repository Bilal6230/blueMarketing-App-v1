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

describe('PremiumLoginScreen invalid credentials', () => {
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

  it('shows an authentication error for invalid credentials', async () => {
    mockSignIn.mockRejectedValue(new Error('Incorrect email or password.'));

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
      'wrongpass',
    );
    fireEvent.press(screen.getByTestId('login-sign-in-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'staff@bluemarketing.com',
        password: 'wrongpass',
      });
      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByText('Sign-in failed')).toBeTruthy();
      expect(screen.getByText('Incorrect email or password.')).toBeTruthy();
    });
  });
});
