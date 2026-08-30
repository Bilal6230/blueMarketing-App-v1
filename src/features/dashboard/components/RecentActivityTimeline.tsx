import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RecentActivityItem } from '@/features/dashboard/services/dashboardService';

type RecentActivityTimelineProps = {
  items: RecentActivityItem[];
  onPressItem: (item: RecentActivityItem) => void;
  onPressViewAll: () => void;
};

export function RecentActivityTimeline({
  items,
  onPressItem,
  onPressViewAll,
}: RecentActivityTimelineProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard padding="none" style={styles.panel} surface="elevated">
      <View style={styles.header}>
        <AppText variant="headingMedium">Recent activity</AppText>
        <Pressable
          accessibilityLabel="View all recent activity"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onPressViewAll}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <AppText style={{ color: theme.colors.primary }} variant="labelStrong">
            View all
          </AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <Pressable
            accessibilityLabel={`${item.title}, ${item.timeLabel}, ${item.category}`}
            accessibilityRole="button"
            key={item.id}
            onPress={() => onPressItem(item)}
            style={({ pressed }) => [
              styles.row,
              index < items.length - 1
                ? {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }
                : null,
              { opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <View style={styles.rowLead}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.colors.primarySoft },
                ]}
              >
                <Ionicons color={theme.colors.primary} name={item.icon} size={14} />
              </View>
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{item.title}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {`${item.timeLabel} \u00B7 ${item.category}`}
                </AppText>
              </View>
            </View>
            <Ionicons
              color={theme.colors.textSecondary}
              name="chevron-forward"
              size={16}
            />
          </Pressable>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  dot: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    paddingTop: 8,
  },
  panel: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLead: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
});
