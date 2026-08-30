import type { ComponentTokens, ThemeColors } from '@/theme/types';

export function createComponentTokens(colors: ThemeColors): ComponentTokens {
  return {
    avatar: {
      background: colors.primarySoft,
      foreground: colors.primary,
      ring: colors.surface,
    },
    badge: {
      active: {
        background: colors.primarySoft,
        foreground: colors.primary,
      },
      danger: {
        background: colors.dangerSoft,
        foreground: colors.danger,
      },
      inactive: {
        background: colors.surfaceMuted,
        foreground: colors.textMuted,
      },
      information: {
        background: colors.infoSoft,
        foreground: colors.info,
      },
      neutral: {
        background: colors.surfaceMuted,
        foreground: colors.textSecondary,
      },
      overdue: {
        background: colors.dangerSoft,
        foreground: colors.danger,
      },
      pending: {
        background: colors.warningSoft,
        foreground: colors.warning,
      },
      success: {
        background: colors.successSoft,
        foreground: colors.success,
      },
      warning: {
        background: colors.warningSoft,
        foreground: colors.warning,
      },
    },
    button: {
      compactHeight: 44,
      standardHeight: 56,
      variants: {
        destructive: {
          background: colors.danger,
          backgroundDisabled: colors.surfaceMuted,
          backgroundPressed: '#A52F3D',
          border: 'transparent',
          borderDisabled: 'transparent',
          text: colors.surface,
          textDisabled: colors.textMuted,
        },
        ghost: {
          background: 'transparent',
          backgroundDisabled: 'transparent',
          backgroundPressed: colors.primarySoft,
          border: 'transparent',
          borderDisabled: 'transparent',
          text: colors.primary,
          textDisabled: colors.textMuted,
        },
        outline: {
          background: 'transparent',
          backgroundDisabled: 'transparent',
          backgroundPressed: colors.surfaceMuted,
          border: colors.borderStrong,
          borderDisabled: colors.border,
          text: colors.textPrimary,
          textDisabled: colors.textMuted,
        },
        primary: {
          background: colors.primary,
          backgroundDisabled: colors.surfaceMuted,
          backgroundPressed: colors.primaryPressed,
          border: 'transparent',
          borderDisabled: 'transparent',
          text: colors.surface,
          textDisabled: colors.textMuted,
        },
        secondary: {
          background: colors.surfaceElevated,
          backgroundDisabled: colors.surfaceMuted,
          backgroundPressed: colors.surfaceMuted,
          border: colors.border,
          borderDisabled: colors.border,
          text: colors.textPrimary,
          textDisabled: colors.textMuted,
        },
      },
    },
    card: {
      defaultBackground: colors.surface,
      defaultBorder: colors.border,
      elevatedBackground: colors.surfaceElevated,
      mutedBackground: colors.surfaceMuted,
    },
    divider: {
      default: colors.border,
      strong: colors.borderStrong,
    },
    input: {
      background: colors.inputBackground,
      border: colors.border,
      borderFocused: colors.primary,
      borderInvalid: colors.danger,
      borderSuccess: colors.success,
      controlHeight: 56,
      helper: colors.textMuted,
      placeholder: colors.inputPlaceholder,
      text: colors.textPrimary,
    },
    navigation: {
      barBackground: colors.surfaceElevated,
      barBorder: colors.border,
      iconDefault: colors.textMuted,
      iconSelected: colors.primary,
      indicator: colors.primary,
      labelDefault: colors.textMuted,
      labelSelected: colors.textPrimary,
    },
    overlay: {
      scrim: colors.overlay,
    },
    skeleton: {
      base: colors.skeletonBase,
      highlight: colors.skeletonHighlight,
    },
  };
}
