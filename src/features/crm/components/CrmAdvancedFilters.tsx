import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/controls/AppButton';
import { AppInput } from '@/components/controls/AppInput';
import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import type { CrmFilters, CrmRecordStateFilter, CrmSortBy, CrmSortOrder } from '@/features/crm/services/crmService';

const recordStateOptions: { label: string; value: CrmRecordStateFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const sortByOptions: { label: string; value: CrmSortBy }[] = [
  { label: 'Follow-up date', value: 'follow_up' },
  { label: 'Newest created', value: 'created_at' },
  { label: 'First name', value: 'first_name' },
  { label: 'Last name', value: 'last_name' },
];

const sortOrderOptions: { label: string; value: CrmSortOrder }[] = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
];

type CrmAdvancedFiltersProps = {
  draftFilters: CrmFilters;
  visible: boolean;
  onApply: () => void;
  onChangeFilters: (filters: CrmFilters) => void;
  onClose: () => void;
  onReset: () => void;
};

export function CrmAdvancedFilters({
  draftFilters,
  visible,
  onApply,
  onChangeFilters,
  onClose,
  onReset,
}: CrmAdvancedFiltersProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <AppCard padding="none" style={styles.sheet} surface="elevated">
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <AppText variant="headingMedium">Advanced filters</AppText>
              <AppText color="textSecondary" variant="caption">
                Refine records by state, date and sorting
              </AppText>
            </View>

            <FilterGroup
              options={recordStateOptions}
              selectedValue={draftFilters.recordState}
              title="Record state"
              onSelect={(value) =>
                onChangeFilters({ ...draftFilters, recordState: value as CrmRecordStateFilter })
              }
            />

            <View style={styles.fieldGroup}>
              <AppInput
                helperText="YYYY-MM-DD"
                label="Follow-up date from"
                onChangeText={(value) =>
                  onChangeFilters({ ...draftFilters, followUpFrom: value })
                }
                value={draftFilters.followUpFrom}
              />
              <AppInput
                helperText="YYYY-MM-DD"
                label="Follow-up date to"
                onChangeText={(value) =>
                  onChangeFilters({ ...draftFilters, followUpTo: value })
                }
                value={draftFilters.followUpTo}
              />
            </View>

            <FilterGroup
              options={sortByOptions}
              selectedValue={draftFilters.sortBy}
              title="Sort by"
              onSelect={(value) =>
                onChangeFilters({ ...draftFilters, sortBy: value as CrmSortBy })
              }
            />

            <FilterGroup
              options={sortOrderOptions}
              selectedValue={draftFilters.sortOrder}
              title="Sort order"
              onSelect={(value) =>
                onChangeFilters({ ...draftFilters, sortOrder: value as CrmSortOrder })
              }
            />

            <View style={styles.actions}>
              <AppButton
                fullWidth={false}
                onPress={onReset}
                title="Reset"
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                onPress={onApply}
                title="Apply filters"
              />
            </View>
          </ScrollView>
        </AppCard>
      </View>
    </Modal>
  );
}

type FilterGroupProps = {
  options: { label: string; value: string }[];
  selectedValue: string;
  title: string;
  onSelect: (value: string) => void;
};

function FilterGroup({
  options,
  selectedValue,
  title,
  onSelect,
}: FilterGroupProps) {
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="labelStrong">{title}</AppText>
      <View style={styles.chipGroup}>
        {options.map((option) => {
          const selected = option.value === selectedValue;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [
                styles.chip,
                selected ? styles.chipSelected : null,
                { opacity: pressed ? 0.86 : 1 },
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
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  chip: {
    alignItems: 'center',
    borderColor: '#D7E0EB',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipSelected: {
    backgroundColor: '#EEF5FF',
    borderColor: '#2878F0',
  },
  content: {
    gap: 16,
    padding: 16,
  },
  fieldGroup: {
    gap: 10,
  },
  header: {
    gap: 4,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '82%',
    width: '100%',
  },
});
