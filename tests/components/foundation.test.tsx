import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppButton, Screen } from '@/components';
import { ThemeProvider, useThemeContext } from '@/providers/ThemeProvider';

describe('foundation components', () => {
  it('renders button loading state accessibly', async () => {
    const { getByRole } = await render(
      <ThemeProvider initialPreference="light">
        <AppButton loading title="Continue" />
      </ThemeProvider>,
    );

    expect(getByRole('button')).toHaveAccessibilityState({
      busy: true,
      disabled: true,
    });
  });

  it('renders button disabled state accessibly', async () => {
    const { getByRole } = await render(
      <ThemeProvider initialPreference="light">
        <AppButton disabled title="Continue" />
      </ThemeProvider>,
    );

    expect(getByRole('button')).toBeDisabled();
  });

  it('renders screen content', async () => {
    const { getByText } = await render(
      <ThemeProvider initialPreference="light">
        <Screen scrollable={false}>
          <Text>Hello foundation</Text>
        </Screen>
      </ThemeProvider>,
    );

    expect(getByText('Hello foundation')).toBeTruthy();
  });

  it('supplies theme tokens through the provider', async () => {
    const Probe = () => {
      const { theme } = useThemeContext();
      return <Text>{theme.colors.primary}</Text>;
    };

    const { getByText } = await render(
      <ThemeProvider initialPreference="light">
        <Probe />
      </ThemeProvider>,
    );

    expect(getByText('#1656B8')).toBeTruthy();
  });
});
