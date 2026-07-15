import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';
import { ProgressBar } from '@/components/data-display/ProgressBar';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import type { StatusBadgeVariant } from '@/components/data-display/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';

type MetricCardProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  progress?: number;
  supportText?: string;
  trend?: {
    label: string;
    tone: StatusBadgeVariant;
  };
  value: string;
};

export function MetricCard({
  icon,
  label,
  progress,
  supportText,
  trend,
  value,
}: MetricCardProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard surface="elevated">
      <View style={styles.header}>
        <AppText color="textSecondary" variant="label">
          {label}
        </AppText>
        {icon ? (
          <Ionicons
            accessibilityElementsHidden
            color={theme.colors.textMuted}
            name={icon}
            size={18}
          />
        ) : null}
      </View>
      <AppText variant="numericLarge">{value}</AppText>
      {supportText ? (
        <AppText color="textSecondary" variant="caption">
          {supportText}
        </AppText>
      ) : null}
      {typeof progress === 'number' ? (
        <ProgressBar progress={progress} />
      ) : null}
      {trend ? <StatusBadge label={trend.label} variant={trend.tone} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
