import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

type IconButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
};

export function IconButton({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  icon,
  onPress,
  selected = false,
  testID,
}: IconButtonProps) {
  const { theme } = useAppTheme();

  return (
    <PressableScale
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected
            ? theme.colors.primarySoft
            : pressed
              ? theme.colors.surfaceMuted
              : theme.colors.surfaceElevated,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
      testID={testID}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          accessibilityElementsHidden
          color={selected ? theme.colors.primary : theme.colors.textPrimary}
          name={icon}
          size={20}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
