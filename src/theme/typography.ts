import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 38,
  },
});

export type TypographyVariant = keyof typeof typography;
