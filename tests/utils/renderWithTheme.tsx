import type { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/providers/ThemeProvider';
import type { ThemePreference } from '@/theme';

type ThemeWrapperProps = PropsWithChildren<{
  preference?: ThemePreference;
}>;

export function ThemeWrapper({
  children,
  preference = 'light',
}: ThemeWrapperProps) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ThemeProvider initialPreference={preference}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

export async function renderWithTheme(
  ui: ReactElement,
  preference: ThemePreference = 'light',
) {
  return render(<ThemeWrapper preference={preference}>{ui}</ThemeWrapper>);
}
