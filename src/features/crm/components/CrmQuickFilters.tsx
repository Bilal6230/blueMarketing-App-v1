import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { CrmQuickFilter } from '@/features/crm/services/crmService';

const quickFilterOptions: { label: string; value: CrmQuickFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
];

type CrmQuickFiltersProps = {
  activeFilterCount: number;
  selectedFilter: CrmQuickFilter;
  onOpenAdvancedFilters: () => void;
  onSelectFilter: (filter: CrmQuickFilter) => void;
};

export function CrmQuickFilters({
  activeFilterCount,
  selectedFilter,
  onOpenAdvancedFilters,
  onSelectFilter,
}: CrmQuickFiltersProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
      >
        <View style={styles.filterRow}>
          {quickFilterOptions.map((option) => {
            const selected = option.value === selectedFilter;

            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.value}
                onPress={() => onSelectFilter(option.value)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: selected
                      ? theme.colors.primarySoft
                      : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    opacity: pressed ? 0.86 : 1,
                  },
                ]}
              >
                <AppText
                  color={selected ? 'primary' : 'textSecondary'}
                  variant="labelStrong"
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Open advanced filters"
        accessibilityRole="button"
        onPress={onOpenAdvancedFilters}
        style={({ pressed }) => [
          styles.filterButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <Ionicons color={theme.colors.textPrimary} name="options-outline" size={18} />
        {activeFilterCount > 0 ? (
          <View
            style={[
              styles.filterCountBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <AppText style={styles.filterCountText} variant="captionStrong">
              {String(activeFilterCount)}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  filterChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  filterCountBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  filterCountText: {
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  filters: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
