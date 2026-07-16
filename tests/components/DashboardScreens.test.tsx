import { act, fireEvent } from '@testing-library/react-native';

import { AdminHomeScreen } from '@/features/dashboard/screens/AdminHomeScreen';
import { StaffHomeScreen } from '@/features/dashboard/screens/StaffHomeScreen';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('dashboard screens', () => {
  it('renders the staff dashboard inside the tab scaffold', async () => {
    const { getByText } = await renderWithTheme(<StaffHomeScreen />);

    expect(getByText('Good morning, Bilal')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
  });

  it('shows a preview notice for staff notifications', async () => {
    const { findByText, getByTestId } = await renderWithTheme(<StaffHomeScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('staff-notifications-button'));
    });
    expect(
      await findByText(
        'Notifications are not connected yet. This is a preview notice only.',
      ),
    ).toBeTruthy();
  });

  it('renders the admin dashboard inside the tab scaffold', async () => {
    const { getByText } = await renderWithTheme(<AdminHomeScreen />);

    expect(getByText('Administrator command')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
  });
});
