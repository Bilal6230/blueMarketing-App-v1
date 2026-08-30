import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { ProgressBar } from '@/components/data-display/ProgressBar';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { OverviewBarItem } from '@/features/dashboard/services/dashboardService';

type PerformancePanelProps = {
  items: OverviewBarItem[];
  onPressItem: (item: OverviewBarItem) => void;
};

export function PerformancePanel({
  items,
  onPressItem,
}: PerformancePanelProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard style={styles.panel} surface="elevated">
      <View style={styles.header}>
        <AppText variant="headingMedium">Operational performance</AppText>
        <AppText color="textSecondary" variant="caption">
          This week
        </AppText>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            accessibilityLabel={`${item.label}: ${Math.round(item.progress * 100)} percent`}
            accessibilityRole="button"
            key={item.label}
            onPress={() => onPressItem(item)}
            style={({ pressed }) => [
              styles.item,
              { opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <View style={styles.itemHeader}>
              <AppText style={styles.label} variant="bodyStrong">
                {item.label}
              </AppText>
              <View style={styles.valueRow}>
                <AppText variant="labelStrong">
                  {`${Math.round(item.progress * 100)}%`}
                </AppText>
                <Ionicons
                  color={theme.colors.textSecondary}
                  name="chevron-forward"
                  size={16}
                />
              </View>
            </View>
            <ProgressBar progress={item.progress} />
          </Pressable>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  item: {
    gap: 10,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  list: {
    gap: 16,
  },
  panel: {
    gap: 16,
  },
  valueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
