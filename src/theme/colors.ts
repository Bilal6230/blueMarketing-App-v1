const lightColors = {
  background: '#F3F7FC',
  border: '#D4DCE8',
  borderStrong: '#A5B4C7',
  danger: '#B94444',
  info: '#2C6EBF',
  primary: '#1656B8',
  primaryPressed: '#0E428D',
  primarySoft: '#DDE9FB',
  success: '#2A7A5A',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FBFF',
  surfaceMuted: '#E9F0F8',
  textMuted: '#607287',
  textPrimary: '#122033',
  textSecondary: '#3E526A',
  warning: '#A8681A',
} as const;

const darkColors: typeof lightColors = {
  background: '#08111D',
  border: '#22344A',
  borderStrong: '#46627F',
  danger: '#E07C7C',
  info: '#6EA2F1',
  primary: '#4E8EF8',
  primaryPressed: '#356FD5',
  primarySoft: '#16396A',
  success: '#62B894',
  surface: '#0F1C2D',
  surfaceElevated: '#142538',
  surfaceMuted: '#0C1725',
  textMuted: '#92A6BE',
  textPrimary: '#F3F7FC',
  textSecondary: '#C2D0DF',
  warning: '#E8B36A',
};

export { darkColors, lightColors };
