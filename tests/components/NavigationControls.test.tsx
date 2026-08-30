import { Text } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import {
  AppTabScaffold,
  BottomNavigation,
  FilterChip,
  IconButton,
} from '@/components';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { renderWithTheme } from '../utils/renderWithTheme';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('navigation and selection controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon button accessibility state', async () => {
    const { getByTestId } = await renderWithTheme(
      <IconButton
        accessibilityLabel="Notifications"
        disabled
        icon="notifications-outline"
        selected
        testID="notifications-button"
      />,
    );

    expect(
      getByTestId('notifications-button').props.accessibilityState,
    ).toEqual({
      disabled: true,
      selected: true,
    });
  });

  it('renders selected filter chips', async () => {
    const { getByText } = await renderWithTheme(
      <FilterChip label="Active" selected />,
    );

    expect(getByText('Active').parent?.props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('changes bottom navigation using real app routes', async () => {
    const { getByLabelText, queryByText } = await renderWithTheme(
      <BottomNavigation
        items={getBottomNavigationItems('staff')}
        selectedKey="home"
      />,
    );

    fireEvent.press(getByLabelText('CRM'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)/crm');
    });
    expect(queryByText('Preview')).toBeNull();
    expect(queryByText('Design System')).toBeNull();
  });

  it('renders the fixed tab scaffold content with navigation', async () => {
    const { getByText } = await renderWithTheme(
      <AppTabScaffold
        items={getBottomNavigationItems('staff')}
        selectedKey="home"
      >
        <Text>Scrollable content</Text>
      </AppTabScaffold>,
    );

    expect(getByText('Scrollable content')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });
});
