import { fireEvent, waitFor } from '@testing-library/react-native';

import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      accessToken: 'token',
      clearSession: jest.fn().mockResolvedValue({ ok: true }),
      permissions: ['profile.view'],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['staff'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    } as never);
  });

  it('logs out and returns the user to login', async () => {
    const { getByText } = await renderWithTheme(<ProfileScreen />);

    fireEvent.press(getByText('Logout').parent as never);

    await waitFor(() => {
      expect(useAuthStore.getState().clearSession).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('renders a non-interactive avatar instead of a profile button', async () => {
    const { getByLabelText, queryByLabelText } = await renderWithTheme(
      <ProfileScreen />,
    );

    expect(getByLabelText('Avatar BI')).toBeTruthy();
    expect(queryByLabelText('Open profile')).toBeNull();
  });
});
