import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { CrmQuickFilter, CrmSummary as CrmSummaryType } from '@/features/crm/services/crmService';

type CrmSummaryProps = {
  selectedFilter: CrmQuickFilter;
  summary: CrmSummaryType;
  onSelectFilter: (filter: CrmQuickFilter) => void;
};

export function CrmSummary({
  selectedFilter,
  summary,
  onSelectFilter,
}: CrmSummaryProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityLabel={`Total leads ${summary.totalLeads}`}
        accessibilityRole="button"
        onPress={() => onSelectFilter('all')}
        style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}
      >
        <AppCard
          padding="none"
          style={[
            styles.totalCard,
            {
              backgroundColor: theme.colors.primarySoft,
              borderColor:
                selectedFilter === 'all'
                  ? theme.colors.primary
                  : 'rgba(40, 120, 240, 0.18)',
            },
          ]}
          surface="elevated"
        >
          <View style={styles.totalHeader}>
            <View style={styles.totalCopy}>
              <AppText color="textSecondary" variant="captionStrong">
                Total leads
              </AppText>
              <AppText variant="displayMedium">
                {String(summary.totalLeads)}
              </AppText>
            </View>
            <View
              style={[
                styles.activeBadge,
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <AppText color="textSecondary" variant="caption">
                Active
              </AppText>
              <AppText variant="labelStrong">{String(summary.activeLeads)}</AppText>
            </View>
          </View>
        </AppCard>
      </Pressable>

      <View style={styles.subGrid}>
        <SummaryMiniCard
          accentColor={theme.colors.warning}
          label="Due today"
          onPress={() => onSelectFilter('today')}
          selected={selectedFilter === 'today'}
          value={summary.todayFollowups}
        />
        <SummaryMiniCard
          accentColor={theme.colors.danger}
          label="Overdue"
          onPress={() => onSelectFilter('overdue')}
          selected={selectedFilter === 'overdue'}
          value={summary.overdueFollowups}
        />
      </View>
    </View>
  );
}

type SummaryMiniCardProps = {
  accentColor: string;
  label: string;
  onPress: () => void;
  selected: boolean;
  value: number;
};

function SummaryMiniCard({
  accentColor,
  label,
  onPress,
  selected,
  value,
}: SummaryMiniCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`${label} ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.miniPressable, { opacity: pressed ? 0.86 : 1 }]}
    >
      <AppCard
        padding="none"
        style={[
          styles.miniCard,
          {
            borderColor: selected ? accentColor : theme.colors.border,
          },
        ]}
        surface="elevated"
      >
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <AppText color="textSecondary" variant="captionStrong">
          {label}
        </AppText>
        <AppText variant="headingMedium">{String(value)}</AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeBadge: {
    borderRadius: 999,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  miniCard: {
    gap: 10,
    minHeight: 104,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  miniPressable: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    gap: 12,
  },
  subGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  totalCard: {
    gap: 10,
    minHeight: 112,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalCopy: {
    gap: 4,
  },
  totalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
