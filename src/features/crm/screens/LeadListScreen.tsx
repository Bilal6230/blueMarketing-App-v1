import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  EmptyState,
  ErrorState,
  FilterChip,
  InlineMessage,
  ListItem,
  OfflineBanner,
  SearchInput,
  SectionHeader,
  SkeletonCard,
  StatusBadge,
} from '@/components';
import { staffPreviewNavigation } from '@/features/preview/navigationModel';
import { crmLeadsMock } from '@/mocks/crm';
import { lightImpactFeedback, selectionFeedback } from '@/services/haptics';

const filters = ['All', 'Active', 'Overdue', 'Pending'] as const;
const previewStates = [
  { label: 'Loaded', value: 'loaded' },
  { label: 'Loading', value: 'loading' },
  { label: 'Empty', value: 'empty' },
  { label: 'Filtered empty', value: 'filtered_empty' },
  { label: 'Offline', value: 'offline' },
  { label: 'Error', value: 'error' },
] as const;

type PreviewState = (typeof previewStates)[number]['value'];

export function LeadListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [notice, setNotice] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>('loaded');
  const [search, setSearch] = useState('');

  const leads = useMemo(() => {
    if (previewState === 'empty' || previewState === 'filtered_empty') {
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
  }, [filter, previewState, search]);

  return (
    <AppTabScaffold
      items={staffPreviewNavigation}
      selectedKey="crm"
      testID="crm-lead-list-screen"
    >
      <SectionHeader subtitle="CRM list preview" title="Lead pipeline" />
      {notice ? (
        <InlineMessage
          message={notice}
          title="Preview notice"
          tone="information"
        />
      ) : null}
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
            onPress={() => setFilter(item)}
            selected={item === filter}
          />
        ))}
      </View>
      <AppCard surface="muted">
        <AppText variant="labelStrong">
          {leads.length} leads in this view
        </AppText>
        <AppText color="textSecondary" variant="caption">
          Review explicit preview states for this prototype list.
        </AppText>
        <View style={styles.previewStateRow}>
          {previewStates.map((item) => (
            <FilterChip
              accessibilityLabel={`CRM preview state ${item.label}`}
              key={item.value}
              label={item.label}
              onPress={async () => {
                await selectionFeedback();
                setPreviewState(item.value);
              }}
              selected={previewState === item.value}
            />
          ))}
        </View>
      </AppCard>

      {previewState === 'offline' ? <OfflineBanner /> : null}

      {previewState === 'loading' ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : previewState === 'error' ? (
        <ErrorState
          actionLabel="Restore loaded state"
          onPressAction={() => setPreviewState('loaded')}
          subtitle="No CRM request was sent. This error state is available only for UI review."
          title="CRM preview error"
        />
      ) : leads.length === 0 ? (
        <EmptyState
          actionLabel="Reset filters"
          onPressAction={() => {
            setFilter('All');
            setSearch('');
            setPreviewState('loaded');
          }}
          subtitle={
            previewState === 'filtered_empty'
              ? 'No leads match the current preview filters.'
              : 'There are no leads in this selected preview state.'
          }
          title={
            previewState === 'filtered_empty'
              ? 'Nothing matches your filters'
              : 'Nothing to review right now'
          }
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
            subtitle={`${lead.maskedPhone} \u00B7 ${lead.followUp} \u00B7 Assigned to ${lead.assignedTo}`}
            title={lead.name}
          />
        ))
      )}

      <AppButton
        onPress={async () => {
          await lightImpactFeedback();
          setNotice(
            'Add lead is a preview-only action. No lead is created in this sprint.',
          );
        }}
        title="Add lead"
        trailingIcon="add-outline"
      />
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewStateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
