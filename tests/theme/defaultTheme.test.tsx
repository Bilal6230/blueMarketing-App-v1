import * as ReactNative from 'react-native';

import { AppText } from '@/components';
import { ThemeProvider, useThemeContext } from '@/providers/ThemeProvider';
import { renderWithTheme } from '../utils/renderWithTheme';

function ThemeProbe() {
  const { colorScheme, themePreference } = useThemeContext();

  return <AppText>{`${themePreference}:${colorScheme}`}</AppText>;
}

describe('ThemeProvider defaults', () => {
  it('defaults to light even when the system preference is dark', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { getByText } = await renderWithTheme(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(getByText('light:light')).toBeTruthy();
  });
});
