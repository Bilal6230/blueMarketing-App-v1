import { renderWithTheme } from '../utils/renderWithTheme';
import AppIndexRoute from '../../app/(app)/index';
import { useAuthStore } from '@/store/authStore';

describe('dashboard routing', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'token',
      permissions: ['dashboard.view'],
      projects: [{ id: 101, name: 'Blue Residency' }],
      roles: ['staff'],
      selectedProjectId: 101,
      status: 'authenticated',
      user: { email: 'staff@bluemarketing.com', id: 2, name: 'Bilal Iqbal' },
    });
  });

  it('renders the staff dashboard for staff sessions', async () => {
    const { getByTestId, getByText } = await renderWithTheme(<AppIndexRoute />);

    expect(getByTestId('staff-home-screen')).toBeTruthy();
    expect(getByText("Today's priorities")).toBeTruthy();
  });

  it('renders the administrator dashboard for administrator sessions', async () => {
    useAuthStore.setState({
      roles: ['administrator'],
      user: {
        email: 'admin@bluemarketing.com',
        id: 1,
        name: 'Sana Ahmed',
      },
    });

    const { getByTestId, getByText } = await renderWithTheme(<AppIndexRoute />);

    expect(getByTestId('admin-home-screen')).toBeTruthy();
    expect(getByText('Sales and collection metrics')).toBeTruthy();
  });
});
