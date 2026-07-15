import type { TextStyle, ViewStyle } from 'react-native';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  focusRing: string;
  inputBackground: string;
  inputPlaceholder: string;
  skeletonBase: string;
  skeletonHighlight: string;
  gradientHeroStart: string;
  gradientHeroEnd: string;
};

export type SpacingScale = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  screenHorizontal: number;
  screenTop: number;
  sectionGap: number;
  cardPadding: number;
  controlGap: number;
  inlineGap: number;
};

export type RadiusScale = {
  small: number;
  medium: number;
  large: number;
  xLarge: number;
  pill: number;
};

export type ElevationScale = {
  card: ViewStyle;
  floating: ViewStyle;
  overlay: ViewStyle;
};

export type MotionScale = {
  durationInstant: number;
  durationFast: number;
  durationNormal: number;
  durationSlow: number;
  easeStandard: readonly [number, number, number, number];
  easeEmphasized: readonly [number, number, number, number];
  springGentle: {
    damping: number;
    mass: number;
    stiffness: number;
  };
  springResponsive: {
    damping: number;
    mass: number;
    stiffness: number;
  };
};

export type TypographyVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'headingLarge'
  | 'headingMedium'
  | 'headingSmall'
  | 'title'
  | 'bodyLarge'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'labelStrong'
  | 'caption'
  | 'captionStrong'
  | 'numericHero'
  | 'numericLarge'
  | 'numericMedium';

export type TypographyScale = Record<TypographyVariant, TextStyle>;

export type ButtonTokens = {
  compactHeight: number;
  standardHeight: number;
  variants: {
    destructive: ButtonVariantTokens;
    ghost: ButtonVariantTokens;
    outline: ButtonVariantTokens;
    primary: ButtonVariantTokens;
    secondary: ButtonVariantTokens;
  };
};

export type ButtonVariantTokens = {
  background: string;
  backgroundDisabled: string;
  backgroundPressed: string;
  border: string;
  borderDisabled: string;
  text: string;
  textDisabled: string;
};

export type InputTokens = {
  background: string;
  border: string;
  borderFocused: string;
  borderInvalid: string;
  borderSuccess: string;
  controlHeight: number;
  helper: string;
  placeholder: string;
  text: string;
};

export type CardTokens = {
  defaultBackground: string;
  defaultBorder: string;
  elevatedBackground: string;
  mutedBackground: string;
};

export type NavigationTokens = {
  barBackground: string;
  barBorder: string;
  iconDefault: string;
  iconSelected: string;
  indicator: string;
  labelDefault: string;
  labelSelected: string;
};

export type BadgeTokens = {
  active: BadgeVariantTokens;
  danger: BadgeVariantTokens;
  inactive: BadgeVariantTokens;
  information: BadgeVariantTokens;
  neutral: BadgeVariantTokens;
  overdue: BadgeVariantTokens;
  pending: BadgeVariantTokens;
  success: BadgeVariantTokens;
  warning: BadgeVariantTokens;
};

export type BadgeVariantTokens = {
  background: string;
  foreground: string;
};

export type AvatarTokens = {
  background: string;
  foreground: string;
  ring: string;
};

export type DividerTokens = {
  default: string;
  strong: string;
};

export type OverlayTokens = {
  scrim: string;
};

export type SkeletonTokens = {
  base: string;
  highlight: string;
};

export type ComponentTokens = {
  avatar: AvatarTokens;
  badge: BadgeTokens;
  button: ButtonTokens;
  card: CardTokens;
  divider: DividerTokens;
  input: InputTokens;
  navigation: NavigationTokens;
  overlay: OverlayTokens;
  skeleton: SkeletonTokens;
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type AppTheme = {
  colors: ThemeColors;
  component: ComponentTokens;
  elevation: ElevationScale;
  motion: MotionScale;
  radius: RadiusScale;
  spacing: SpacingScale;
  typography: TypographyScale;
};

export type ThemeColorToken = keyof ThemeColors;
