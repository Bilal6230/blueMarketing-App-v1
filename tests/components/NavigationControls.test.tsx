import { Text } from 'react-native';

import {
  AppTabScaffold,
  BottomNavigation,
  FilterChip,
  IconButton,
} from '@/components';
import { renderWithTheme } from '../utils/renderWithTheme';

describe('navigation and selection controls', () => {
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

    expect(getByTestId('notifications-button').props.accessibilityState).toEqual({
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

  it('renders the bottom navigation with the selected tab', async () => {
    const { getByText } = await renderWithTheme(
      <BottomNavigation
        items={[
          {
            href: '/(preview)/staff-home',
            icon: 'home-outline',
            key: 'home',
            label: 'Home',
          },
          {
            href: '/(preview)/crm',
            icon: 'people-outline',
            key: 'crm',
            label: 'CRM',
          },
        ]}
        selectedKey="crm"
      />,
    );

    expect(getByText('CRM').parent?.props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('renders the fixed tab scaffold content with navigation', async () => {
    const { getByText } = await renderWithTheme(
      <AppTabScaffold
        items={[
          {
            href: '/(preview)/staff-home',
            icon: 'home-outline',
            key: 'home',
            label: 'Home',
          },
        ]}
        selectedKey="home"
      >
        <Text>Scrollable content</Text>
      </AppTabScaffold>,
    );

    expect(getByText('Scrollable content')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
  });
});
