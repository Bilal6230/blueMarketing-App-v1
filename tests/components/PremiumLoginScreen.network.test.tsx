import { cleanup, fireEvent, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/api/errors';
import { PremiumLoginScreen } from '@/features/auth';
import { signIn } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@/features/auth/services/authService', () => ({
  signIn: jest.fn(),
}));

jest.mock('@/components', () => {
  const actual = jest.requireActual('@/components');
  const { View: MockView } = jest.requireActual('react-native');

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

describe('PremiumLoginScreen network errors', () => {
  const mockSignIn = jest.mocked(signIn);

  beforeEach(() => {
    jest.clearAllMocks();
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
      setSession: jest.fn(),
      status: 'unauthenticated',
      user: null,
    } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the network error message', async () => {
    mockSignIn.mockRejectedValue(
      new ApiError({
        errorKey: 'network',
        message:
          'Unable to connect to the server. Check your internet connection and try again.',
        retryable: true,
        statusCode: null,
      }),
    );

    const screen = await renderWithTheme(<PremiumLoginScreen />);

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
      expect(
        screen.getByText(
          'Unable to connect to the server. Check your internet connection and try again.',
        ),
      ).toBeTruthy();
    });
  });
});
