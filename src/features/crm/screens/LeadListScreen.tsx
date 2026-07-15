import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppText,
  EmptyState,
  FilterChip,
  ListItem,
  OfflineBanner,
  Screen,
  SearchInput,
  SectionHeader,
  SkeletonCard,
  StatusBadge,
} from '@/components';
import { crmLeadsMock } from '@/mocks/crm';
import { lightImpactFeedback } from '@/services/haptics';

const filters = ['All', 'Active', 'Overdue', 'Pending'] as const;

export function LeadListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const leads = useMemo(() => {
    if (showEmpty) {
      return [];
    }

    return crmLeadsMock.filter((lead) => {
      const filterMatch =
        filter === 'All'
          ? true
          : lead.status.toLowerCase() === filter.toLowerCase();
      const searchMatch = `${lead.name} ${lead.assignedTo}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return filterMatch && searchMatch;
    });
  }, [filter, search, showEmpty]);

  return (
    <Screen>
      <SectionHeader subtitle="CRM list preview" title="Lead pipeline" />
      <SearchInput
        label="Search leads"
        onChangeText={setSearch}
        placeholder="Search by lead or assigned user"
        value={search}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filters.map((item) => (
          <FilterChip
            key={item}
            label={item}
            onPress={() => setFilter(item)}
            selected={item === filter}
          />
        ))}
      </View>
      <OfflineBanner />
      <AppCard surface="muted">
        <AppText variant="labelStrong">
          {leads.length} leads in this view
        </AppText>
        <AppText color="textSecondary" variant="caption">
          Toggle loading and empty states for review.
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <AppButton
            compact
            fullWidth={false}
            onPress={() => setShowLoading((value) => !value)}
            title={showLoading ? 'Hide loading' : 'Show loading'}
            variant="secondary"
          />
          <AppButton
            compact
            fullWidth={false}
            onPress={() => setShowEmpty((value) => !value)}
            title={showEmpty ? 'Hide empty' : 'Show empty'}
            variant="ghost"
          />
        </View>
      </AppCard>

      {showLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : leads.length === 0 ? (
        <EmptyState
          actionLabel="Reset filters"
          onPressAction={() => {
            setFilter('All');
            setSearch('');
            setShowEmpty(false);
          }}
          subtitle="No leads match the current preview filters."
          title="Nothing to review right now"
        />
      ) : (
        leads.map((lead) => (
          <ListItem
            accessory={
              <StatusBadge label={lead.status} variant={lead.statusTone} />
            }
            icon="person-outline"
            key={lead.name}
            onPress={() => router.push('/(preview)/lead-detail')}
            subtitle={`${lead.maskedPhone} · ${lead.followUp} · Assigned to ${lead.assignedTo}`}
            title={lead.name}
          />
        ))
      )}

      <AppButton
        onPress={async () => {
          await lightImpactFeedback();
        }}
        title="Add lead"
        trailingIcon="add-outline"
      />
    </Screen>
  );
}
