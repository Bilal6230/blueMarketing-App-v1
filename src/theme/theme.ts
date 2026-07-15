import { darkColors, lightColors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { motion } from '@/theme/motion';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const lightTheme = {
  colors: lightColors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
} as const;

export const darkTheme: typeof lightTheme = {
  colors: darkColors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
};

export type AppTheme = typeof lightTheme;
export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeColorToken = keyof typeof lightTheme.colors;
