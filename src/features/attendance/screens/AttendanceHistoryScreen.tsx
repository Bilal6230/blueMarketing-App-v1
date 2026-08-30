import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppTabScaffold,
  AppText,
  BackButton,
  EmptyState,
  FilterChip,
  InlineMessage,
} from '@/components';
import { AttendanceHistoryRow } from '@/features/attendance/components/AttendanceHistoryRow';
import {
  buildAttendanceHistoryPresetRange,
  type AttendanceHistoryPreset,
} from '@/features/attendance/utils/historyPresets';
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { useAuthStore } from '@/store/authStore';

const presetItems: { key: AttendanceHistoryPreset; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'this_month', label: 'This month' },
];

export const attendanceHistoryContentContainerStyle = {
  paddingBottom: 0,
};

export const attendanceHistoryListContentStyle = {
  gap: 10,
  paddingBottom: 8,
};

export function AttendanceHistoryScreen() {
  const roles = useAuthStore((state) => state.roles);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const projects = useAuthStore((state) => state.projects);
  const role = resolvePrimaryRole(roles);
  const history = useAttendanceStore((state) => state.history);
  const historyError = useAttendanceStore((state) => state.historyError);
  const historyMeta = useAttendanceStore((state) => state.historyMeta);
  const isLoadingHistory = useAttendanceStore(
    (state) => state.isLoadingHistory,
  );
  const isLoadingMoreHistory = useAttendanceStore(
    (state) => state.isLoadingMoreHistory,
  );
  const loadHistory = useAttendanceStore((state) => state.loadHistory);
  const loadMoreHistory = useAttendanceStore((state) => state.loadMoreHistory);
  const [selectedPreset, setSelectedPreset] =
    useState<AttendanceHistoryPreset>('all');
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;
  const projectId = selectedProject?.id ?? null;

  const activeFilters = useMemo(() => {
    if (!projectId) {
      return null;
    }

    return {
      ...buildAttendanceHistoryPresetRange(selectedPreset),
      page: 1,
      perPage: 10,
      projectId,
    };
  }, [projectId, selectedPreset]);

  useEffect(() => {
    if (!activeFilters) {
      return;
    }

    void loadHistory(activeFilters);
  }, [activeFilters, loadHistory]);

  if (!selectedProject || !activeFilters) {
    return (
      <AppTabScaffold
        contentContainerStyle={attendanceHistoryContentContainerStyle}
        items={getBottomNavigationItems(role)}
        scrollable={false}
        selectedKey="attendance"
        testID="attendance-history-screen"
      >
        <EmptyState
          subtitle="Select a project to view attendance history."
          title="No attendance records"
        />
      </AppTabScaffold>
    );
  }

  return (
    <AppTabScaffold
      contentContainerStyle={attendanceHistoryContentContainerStyle}
      items={getBottomNavigationItems(role)}
      scrollable={false}
      selectedKey="attendance"
      testID="attendance-history-screen"
    >
      <View style={styles.headerSection}>
        <AppHeader
          leftAction={<BackButton />}
          subtitle={selectedProject.name}
          title="Attendance history"
        />
        <View style={styles.filtersWrap}>
          {presetItems.map((item) => (
            <FilterChip
              accessibilityLabel={`Attendance filter ${item.label}`}
              key={item.key}
              label={item.label}
              onPress={() => setSelectedPreset(item.key)}
              selected={selectedPreset === item.key}
            />
          ))}
        </View>
        <AppText color="textSecondary" variant="captionStrong">
          {`${historyMeta?.total ?? 0} records`}
        </AppText>
        {historyError ? (
          <InlineMessage
            message={historyError}
            title="Attendance"
            tone="danger"
          />
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={attendanceHistoryListContentStyle}
        data={history}
        keyExtractor={(item) => String(item.id)}
        onEndReached={() => void loadMoreHistory(activeFilters)}
        onEndReachedThreshold={0.2}
        onRefresh={() => void loadHistory(activeFilters)}
        refreshing={isLoadingHistory}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <AttendanceHistoryRow record={item} />
          </View>
        )}
        style={styles.list}
        ListEmptyComponent={
          isLoadingHistory ? null : (
            <EmptyState
              subtitle="There is no attendance for this date range."
              title="No attendance records"
            />
          )
        }
        ListFooterComponent={
          isLoadingMoreHistory ? (
            <View style={styles.footerCopy}>
              <AppText color="textSecondary" variant="caption">
                Loading more attendance...
              </AppText>
            </View>
          ) : historyMeta && historyMeta.currentPage < historyMeta.lastPage ? (
            <Pressable
              accessibilityLabel="Load more attendance records"
              accessibilityRole="button"
              onPress={() => void loadMoreHistory(activeFilters)}
              style={({ pressed }) => [
                styles.loadMoreButton,
                { opacity: pressed ? 0.74 : 1 },
              ]}
            >
              <AppText color="primary" variant="labelStrong">
                Load more
              </AppText>
            </Pressable>
          ) : null
        }
      />
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerCopy: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  headerSection: {
    gap: 16,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  loadMoreButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 4,
  },
  rowCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E0EB',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
