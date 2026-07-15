import { darkColors, lightColors } from '@/theme/colors';
import { createComponentTokens } from '@/theme/componentTokens';
import { elevation } from '@/theme/elevation';
import { motion } from '@/theme/motion';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { AppTheme } from '@/theme/types';

export const lightTheme: AppTheme = {
  colors: lightColors,
  component: createComponentTokens(lightColors),
  elevation,
  motion,
  radius,
  spacing,
  typography,
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  component: createComponentTokens(darkColors),
  elevation,
  motion,
  radius,
  spacing,
  typography,
};
