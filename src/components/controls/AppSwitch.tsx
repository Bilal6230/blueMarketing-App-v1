import { Switch, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type AppSwitchProps = {
  hint?: string;
  label: string;
  onValueChange?: (value: boolean) => void;
  value: boolean;
};

export function AppSwitch({
  hint,
  label,
  onValueChange,
  value,
}: AppSwitchProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityHint={hint}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="labelStrong">{label}</AppText>
        {hint ? (
          <AppText color="textMuted" variant="caption">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? theme.colors.surface : theme.colors.surfaceElevated}
        trackColor={{
          false: theme.colors.surfaceMuted,
          true: theme.colors.primary,
        }}
        value={value}
      />
    </View>
  );
}
