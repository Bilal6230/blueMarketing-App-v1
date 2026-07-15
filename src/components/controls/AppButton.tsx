import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'compact' | 'standard';

type AppButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  compact?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  onPress?: () => void;
  testID?: string;
  title: string;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  variant?: ButtonVariant;
};

export function AppButton({
  accessibilityHint,
  accessibilityLabel,
  compact = false,
  disabled = false,
  fullWidth = true,
  leadingIcon,
  loading = false,
  onPress,
  testID,
  title,
  trailingIcon,
  variant = 'primary',
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const size: ButtonSize = compact ? 'compact' : 'standard';
  const isDisabled = disabled || loading;
  const tokens = theme.component.button.variants[variant];
  const height =
    size === 'compact'
      ? theme.component.button.compactHeight
      : theme.component.button.standardHeight;

  return (
    <PressableScale
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDisabled
            ? tokens.backgroundDisabled
            : pressed
              ? tokens.backgroundPressed
              : tokens.background,
          borderColor: isDisabled ? tokens.borderDisabled : tokens.border,
          minHeight: height,
          width: fullWidth ? '100%' : undefined,
        },
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        {leadingIcon ? (
          <Ionicons
            accessibilityElementsHidden
            color={isDisabled ? tokens.textDisabled : tokens.text}
            name={leadingIcon}
            size={18}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator
            color={isDisabled ? tokens.textDisabled : tokens.text}
            size="small"
          />
        ) : null}
        <AppText
          color={isDisabled ? 'textMuted' : 'surface'}
          style={{
            color: isDisabled ? tokens.textDisabled : tokens.text,
          }}
          variant="labelStrong"
        >
          {title}
        </AppText>
        {trailingIcon ? (
          <Ionicons
            accessibilityElementsHidden
            color={isDisabled ? tokens.textDisabled : tokens.text}
            name={trailingIcon}
            size={18}
          />
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
