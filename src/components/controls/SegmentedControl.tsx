import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

export type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  accessibilityLabel: string;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  value: T;
};

export function SegmentedControl<T extends string>({
  accessibilityLabel,
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.large,
        },
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <PressableScale
            key={option.value}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                backgroundColor: selected
                  ? theme.colors.surfaceElevated
                  : 'transparent',
                borderRadius: theme.radius.medium,
              },
            ]}
          >
            <AppText
              color={selected ? 'textPrimary' : 'textSecondary'}
              variant="labelStrong"
            >
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
});
