import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppText, EmptyState, SkeletonBlock } from '@/components';
import { AttendanceHistoryRow } from '@/features/attendance/components/AttendanceHistoryRow';
import type { AttendanceHistoryRecord } from '@/features/attendance/services/attendanceService';
import { useAppTheme } from '@/hooks/useAppTheme';

type RecentAttendanceListProps = {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onViewAll: () => void;
  records: AttendanceHistoryRecord[];
};

export function RecentAttendanceList({
  error,
  isLoading,
  onRetry,
  onViewAll,
  records,
}: RecentAttendanceListProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="headingSmall">Recent attendance</AppText>
        <Pressable
          accessibilityLabel="View all attendance"
          accessibilityRole="button"
          onPress={onViewAll}
          style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
          testID="attendance-view-all"
        >
          <AppText color="primary" variant="labelStrong">
            View all
          </AppText>
        </Pressable>
      </View>

      <AppCard padding="none" style={styles.card} surface="elevated">
        {isLoading ? (
          <View style={styles.listBody}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.skeletonRow,
                  index < 2
                    ? {
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }
                    : null,
                ]}
              >
                <SkeletonBlock height={32} width={32} />
                <View style={styles.skeletonCopy}>
                  <SkeletonBlock height={12} width="28%" />
                  <SkeletonBlock height={14} width="58%" />
                  <SkeletonBlock height={10} width="34%" />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.messageWrap}>
            <EmptyState
              actionLabel="Try again"
              onPressAction={onRetry}
              subtitle={error}
              title="Attendance could not be loaded."
            />
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyWrap}>
            <AppText align="center" variant="title">
              No attendance records
            </AppText>
            <AppText align="center" color="textSecondary" variant="body">
              There is no attendance for this date range.
            </AppText>
          </View>
        ) : (
          <View style={styles.listBody}>
            {records.slice(0, 5).map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.rowWrap,
                  index < Math.min(records.length, 5) - 1
                    ? {
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }
                    : null,
                ]}
              >
                <AttendanceHistoryRow record={record} />
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
    overflow: 'hidden',
  },
  container: {
    gap: 12,
  },
  emptyWrap: {
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listBody: {
    gap: 0,
  },
  messageWrap: {
    padding: 12,
  },
  rowWrap: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  skeletonCopy: {
    flex: 1,
    gap: 8,
  },
  skeletonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
});
