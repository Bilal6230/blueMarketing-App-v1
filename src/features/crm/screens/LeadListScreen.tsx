import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppCard,
  AppTabScaffold,
  AppText,
  EmptyState,
  FilterChip,
  ListItem,
  SearchInput,
  SectionHeader,
  StatusBadge,
} from '@/components';
import { leadFixtures } from '@/features/crm/data/leadFixtures';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { selectionFeedback } from '@/services/haptics';

const filters = ['All', 'Active', 'Overdue', 'Pending'] as const;

export function LeadListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');

  const leads = useMemo(() => {
    return leadFixtures.filter((lead) => {
      const filterMatch =
        filter === 'All'
          ? true
          : lead.status.toLowerCase() === filter.toLowerCase();
      const searchMatch = `${lead.name} ${lead.assignedTo}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return filterMatch && searchMatch;
    });
  }, [filter, search]);

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      selectedKey="crm"
      testID="crm-lead-list-screen"
    >
      <SectionHeader
        subtitle="Search and review current assigned leads"
        title="Lead pipeline"
      />
      <SearchInput
        label="Search leads"
        onChangeText={setSearch}
        placeholder="Search by lead or assigned user"
        value={search}
      />
      <View style={styles.filterRow}>
        {filters.map((item) => (
          <FilterChip
            key={item}
            label={item}
            onPress={async () => {
              await selectionFeedback();
              setFilter(item);
            }}
            selected={item === filter}
          />
        ))}
      </View>
      <AppCard surface="muted">
        <AppText variant="labelStrong">
          {leads.length} leads in this view
        </AppText>
        <AppText color="textSecondary" variant="caption">
          Filter by status to prioritise the day&apos;s CRM activity.
        </AppText>
      </AppCard>

      {leads.length === 0 ? (
        <EmptyState
          actionLabel="Reset filters"
          onPressAction={() => {
            setFilter('All');
            setSearch('');
          }}
          subtitle="No leads match the current search and status filters."
          title="Nothing matches your filters"
        />
      ) : (
        leads.map((lead) => (
          <ListItem
            accessory={
              <StatusBadge label={lead.status} variant={lead.statusTone} />
            }
            icon="person-outline"
            key={lead.id}
            onPress={() =>
              router.push({
                params: { leadId: lead.id },
                pathname: '/(app)/lead-detail',
              })
            }
            subtitle={`${lead.maskedPhone} · ${lead.followUp} · Assigned to ${lead.assignedTo}`}
            title={lead.name}
          />
        ))
      )}
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
