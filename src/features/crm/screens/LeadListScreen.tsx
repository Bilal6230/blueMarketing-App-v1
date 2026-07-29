import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppInput,
  AppTabScaffold,
  AppText,
  EmptyState,
  InlineMessage,
} from '@/components';
import { CrmAdvancedFilters } from '@/features/crm/components/CrmAdvancedFilters';
import { CrmHeader } from '@/features/crm/components/CrmHeader';
import { CrmQuickFilters } from '@/features/crm/components/CrmQuickFilters';
import { CrmSummary } from '@/features/crm/components/CrmSummary';
import { LeadCard } from '@/features/crm/components/LeadCard';
import {
  defaultCrmFilters,
  type CrmFilters,
  type CrmQuickFilter,
  type LeadListRecord,
} from '@/features/crm/services/crmService';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { hasCrmPermission } from '@/features/crm/utils/crmPermissions';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { selectionFeedback } from '@/services/haptics';
import { useAuthStore } from '@/store/authStore';

function toQuickFilter(
  value: string | undefined,
): CrmQuickFilter {
  if (!value) {
    return 'all';
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === 'today') {
    return 'today';
  }

  if (normalizedValue === 'overdue') {
    return 'overdue';
  }

  if (normalizedValue === 'upcoming') {
    return 'upcoming';
  }

  return 'all';
}

function getActiveAdvancedFilterCount(filters: CrmFilters) {
  let count = 0;

  if (filters.recordState !== 'all') {
    count += 1;
  }

  if (filters.followUpFrom) {
    count += 1;
  }

  if (filters.followUpTo) {
    count += 1;
  }

  if (filters.sortBy !== defaultCrmFilters.sortBy) {
    count += 1;
  }

  if (filters.sortOrder !== defaultCrmFilters.sortOrder) {
    count += 1;
  }

  return count;
}

export function LeadListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();
  const permissions = useAuthStore((state) => state.permissions);
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const leads = useCrmStore((state) => state.leads);
  const summary = useCrmStore((state) => state.summary);
  const meta = useCrmStore((state) => state.meta);
  const isLoadingLeads = useCrmStore((state) => state.isLoadingLeads);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const projectId = selectedProjectId ?? projects[0]?.id ?? null;
  const canReadLead = hasCrmPermission(permissions, 'read lead');
  const canCreateLead = hasCrmPermission(permissions, 'create lead');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<CrmFilters>({
    ...defaultCrmFilters,
    quickFilter: toQuickFilter(params.status),
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        search: searchInput,
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!projectId || !canReadLead) {
      return;
    }

    void loadLeads(projectId, filters, { page: 1, perPage: 20 });
  }, [canReadLead, filters, loadLeads, projectId]);

  const activeAdvancedFilterCount = useMemo(
    () => getActiveAdvancedFilterCount(filters),
    [filters],
  );

  if (!canReadLead) {
    return (
      <AppTabScaffold
        items={getBottomNavigationItems('staff')}
        selectedKey="crm"
        testID="crm-lead-list-screen"
      >
        <EmptyState
          subtitle="CRM access is not available for this account."
          title="CRM unavailable"
        />
      </AppTabScaffold>
    );
  }

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      scrollable={false}
      selectedKey="crm"
      testID="crm-lead-list-screen"
    >
      <FlatList
        contentContainerStyle={styles.listContent}
        data={leads}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          isLoadingLeads ? null : (
            <EmptyState
              actionLabel={filters.search || activeAdvancedFilterCount > 0 ? 'Reset filters' : undefined}
              onPressAction={
                filters.search || activeAdvancedFilterCount > 0
                  ? () => {
                      setSearchInput('');
                      setFilters(defaultCrmFilters);
                    }
                  : undefined
              }
              subtitle={
                filters.search || activeAdvancedFilterCount > 0 || filters.quickFilter !== 'all'
                  ? 'Try a different name, phone number or filter.'
                  : 'No leads available for this project.'
              }
              title={
                filters.search || activeAdvancedFilterCount > 0 || filters.quickFilter !== 'all'
                  ? 'No leads found'
                  : 'No leads available'
              }
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {notice ? (
              <InlineMessage
                message={notice}
                title="CRM"
                tone="information"
              />
            ) : null}

            <CrmHeader
              canCreateLead={canCreateLead}
              onPressAddLead={() => router.push('/(app)/lead-create')}
            />

            {summary ? (
              <CrmSummary
                selectedFilter={filters.quickFilter}
                summary={summary}
                onSelectFilter={async (quickFilter) => {
                  await selectionFeedback();
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    quickFilter,
                  }));
                }}
              />
            ) : null}

            <AppInput
              accessibilityLabel="Search leads"
              label="Search"
              onChangeText={setSearchInput}
              placeholder="Search by name, phone or NIC"
              trailingAction={
                searchInput ? (
                  <Pressable
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setSearchInput('')}
                    style={styles.clearButton}
                  >
                    <Ionicons color="#526276" name="close-circle" size={18} />
                  </Pressable>
                ) : null
              }
              value={searchInput}
            />

            <CrmQuickFilters
              activeFilterCount={activeAdvancedFilterCount}
              selectedFilter={filters.quickFilter}
              onOpenAdvancedFilters={() => setAdvancedFiltersVisible(true)}
              onSelectFilter={async (quickFilter) => {
                await selectionFeedback();
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  quickFilter,
                }));
              }}
            />

            <AppText color="textSecondary" variant="captionStrong">
              {`${meta?.total ?? leads.length} lead${(meta?.total ?? leads.length) === 1 ? '' : 's'}`}
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onPress={() =>
              router.push({
                params: { leadId: String(item.id) },
                pathname: '/(app)/lead-detail',
              })
            }
            onPressCallError={() => setNotice('Unable to start the phone call.')}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <CrmAdvancedFilters
        draftFilters={draftFilters}
        visible={advancedFiltersVisible}
        onApply={() => {
          setFilters(draftFilters);
          setAdvancedFiltersVisible(false);
        }}
        onChangeFilters={setDraftFilters}
        onClose={() => setAdvancedFiltersVisible(false)}
        onReset={() =>
          setDraftFilters((currentFilters) => ({
            ...currentFilters,
            followUpFrom: '',
            followUpTo: '',
            recordState: 'all',
            sortBy: defaultCrmFilters.sortBy,
            sortOrder: defaultCrmFilters.sortOrder,
          }))
        }
      />
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  headerContent: {
    gap: 16,
    paddingBottom: 4,
  },
  listContent: {
    gap: 14,
    paddingBottom: 24,
  },
});
