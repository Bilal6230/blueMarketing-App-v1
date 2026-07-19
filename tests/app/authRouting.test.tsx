import AppLayout from '../../app/(app)/_layout';
import AuthLayout from '../../app/(auth)/_layout';
import IndexRoute from '../../app/index';
import { useAuthStore } from '@/store/authStore';
import { renderWithTheme } from '../utils/renderWithTheme';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`redirect:${href}`}</Text>;
  },
  Stack: () => {
    const { Text } = require('react-native');
    return <Text>stack</Text>;
  },
}));

describe('auth routing', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      permissions: [],
      projects: [],
      roles: [],
      selectedProjectId: null,
      status: 'unauthenticated',
      user: null,
    });
  });

  it('shows a loading state while the app is booting', async () => {
    useAuthStore.setState({ status: 'booting' });

    const { getByTestId } = await renderWithTheme(<IndexRoute />);

    expect(getByTestId('app-boot-screen')).toBeTruthy();
  });

  it('opens login for unauthenticated root access', async () => {
    const { getByText, queryByText } = await renderWithTheme(<IndexRoute />);

    expect(getByText('redirect:/(auth)/login')).toBeTruthy();
    expect(queryByText('redirect:/(preview)')).toBeNull();
  });

  it('opens the authenticated app for logged-in users', async () => {
    useAuthStore.setState({
      roles: ['staff'],
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    });

    const { getByText } = await renderWithTheme(<IndexRoute />);

    expect(getByText('redirect:/(app)')).toBeTruthy();
  });

  it('redirects authenticated users away from login', async () => {
    useAuthStore.setState({
      roles: ['staff'],
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    });

    const { getByText } = await renderWithTheme(<AuthLayout />);

    expect(getByText('redirect:/(app)')).toBeTruthy();
  });

  it('blocks unauthenticated access to app routes', async () => {
    const { getByText } = await renderWithTheme(<AppLayout />);

    expect(getByText('redirect:/(auth)/login')).toBeTruthy();
  });
});
