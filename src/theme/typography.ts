import { Platform, StyleSheet } from 'react-native';

import type { TypographyScale } from '@/theme/types';

export const manropeFontFamilies = {
  bold:
    Platform.OS === 'web'
      ? 'Manrope_700Bold, Manrope, "Segoe UI", sans-serif'
      : 'Manrope_700Bold',
  medium:
    Platform.OS === 'web'
      ? 'Manrope_500Medium, Manrope, "Segoe UI", sans-serif'
      : 'Manrope_500Medium',
  regular:
    Platform.OS === 'web'
      ? 'Manrope_400Regular, Manrope, "Segoe UI", sans-serif'
      : 'Manrope_400Regular',
  semiBold:
    Platform.OS === 'web'
      ? 'Manrope_600SemiBold, Manrope, "Segoe UI", sans-serif'
      : 'Manrope_600SemiBold',
} as const;

const fontFamily = manropeFontFamilies.regular;
const fontFamilyMedium = manropeFontFamilies.medium;
const fontFamilySemiBold = manropeFontFamilies.semiBold;
const fontFamilyBold = manropeFontFamilies.bold;

const tabular = Platform.select({
  web: { fontVariantNumeric: ['tabular-nums'] as const },
  default: {},
});

export const typography = StyleSheet.create<TypographyScale>({
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    lineHeight: 26,
  },
  bodyStrong: {
    fontFamily: fontFamilySemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  captionStrong: {
    fontFamily: fontFamilySemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  displayLarge: {
    fontFamily: fontFamilyBold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 40,
  },
  displayMedium: {
    fontFamily: fontFamilyBold,
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  headingLarge: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  headingMedium: {
    fontFamily: fontFamilySemiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  headingSmall: {
    fontFamily: fontFamilySemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamilyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  labelStrong: {
    fontFamily: fontFamilySemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  numericHero: {
    ...tabular,
    fontFamily: fontFamilyBold,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  numericLarge: {
    ...tabular,
    fontFamily: fontFamilyBold,
    fontSize: 22,
    lineHeight: 28,
  },
  numericMedium: {
    ...tabular,
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  title: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
});
