import { View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type ProgressBarProps = {
  progress: number;
  tone?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
};

export function ProgressBar({ progress, tone = 'primary' }: ProgressBarProps) {
  const { theme } = useAppTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.pill,
        height: 8,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors[tone],
          borderRadius: theme.radius.pill,
          height: '100%',
          width: `${clamped * 100}%`,
        }}
      />
    </View>
  );
}
