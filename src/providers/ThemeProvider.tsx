import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  darkTheme,
  lightTheme,
  type AppTheme,
  type ThemePreference,
} from '@/theme';

type ThemeContextValue = {
  colorScheme: 'dark' | 'light';
  setThemePreference: (preference: ThemePreference) => void;
  theme: AppTheme;
  themePreference: ThemePreference;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = PropsWithChildren<{
  initialPreference?: ThemePreference;
}>;

export function ThemeProvider({
  children,
  initialPreference = 'system',
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] =
    useState<ThemePreference>(initialPreference);
  const colorScheme =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  const value: ThemeContextValue = {
    colorScheme,
    setThemePreference,
    theme: colorScheme === 'dark' ? darkTheme : lightTheme,
    themePreference,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider.');
  }

  return context;
}
