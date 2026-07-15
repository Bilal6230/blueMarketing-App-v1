import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

type FilterChipProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  selected?: boolean;
};

export function FilterChip({
  icon,
  label,
  onPress,
  selected = false,
}: FilterChipProps) {
  const { theme } = useAppTheme();

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primarySoft
            : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          accessibilityElementsHidden
          color={selected ? theme.colors.primary : theme.colors.textMuted}
          name={icon}
          size={16}
        />
      ) : null}
      <AppText
        color={selected ? 'primary' : 'textSecondary'}
        variant="labelStrong"
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
  },
});
