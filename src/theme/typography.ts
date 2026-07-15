import { Platform, StyleSheet } from 'react-native';

import type { TypographyScale } from '@/theme/types';

const fontFamily = Platform.select({
  android: 'Manrope_400Regular',
  ios: 'Manrope-Regular',
  web: '"Manrope", "Segoe UI", sans-serif',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  android: 'Manrope_500Medium',
  ios: 'Manrope-Medium',
  web: '"Manrope", "Segoe UI", sans-serif',
  default: 'System',
});

const fontFamilySemiBold = Platform.select({
  android: 'Manrope_600SemiBold',
  ios: 'Manrope-SemiBold',
  web: '"Manrope", "Segoe UI", sans-serif',
  default: 'System',
});

const fontFamilyBold = Platform.select({
  android: 'Manrope_700Bold',
  ios: 'Manrope-Bold',
  web: '"Manrope", "Segoe UI", sans-serif',
  default: 'System',
});

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
