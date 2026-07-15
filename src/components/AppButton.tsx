import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { AccessibilityState, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { AppText } from '@/components/AppText';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type AppButtonProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
  variant?: AppButtonVariant;
};

export function AppButton({
  accessibilityLabel,
  disabled = false,
  loading = false,
  onPress,
  style,
  testID,
  title,
  variant = 'primary',
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;
  const palette = getVariantPalette(theme, variant);
  const accessibilityState: AccessibilityState = {
    busy: loading,
    disabled: isDisabled,
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background(pressed, isDisabled),
          borderColor: palette.border(pressed, isDisabled),
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={palette.text} size="small" /> : null}
        <AppText color={palette.textColor} variant="button">
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

function getVariantPalette(
  theme: ReturnType<typeof useAppTheme>['theme'],
  variant: AppButtonVariant,
) {
  switch (variant) {
    case 'secondary':
      return {
        text: theme.colors.textPrimary,
        textColor: 'textPrimary' as const,
        background: (pressed: boolean, disabled: boolean) =>
          disabled
            ? theme.colors.surfaceMuted
            : pressed
              ? theme.colors.surfaceElevated
              : theme.colors.surface,
        border: () => theme.colors.borderStrong,
      };
    case 'ghost':
      return {
        text: theme.colors.primary,
        textColor: 'primary' as const,
        background: (pressed: boolean, disabled: boolean) =>
          disabled
            ? theme.colors.surface
            : pressed
              ? theme.colors.primarySoft
              : 'transparent',
        border: () => 'transparent',
      };
    case 'destructive':
      return {
        text: theme.colors.surface,
        textColor: 'surface' as const,
        background: (pressed: boolean, disabled: boolean) =>
          disabled
            ? theme.colors.surfaceMuted
            : pressed
              ? theme.colors.danger
              : theme.colors.danger,
        border: () => 'transparent',
      };
    case 'primary':
    default:
      return {
        text: theme.colors.surface,
        textColor: 'surface' as const,
        background: (pressed: boolean, disabled: boolean) =>
          disabled
            ? theme.colors.surfaceMuted
            : pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary,
        border: () => 'transparent',
      };
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
});
