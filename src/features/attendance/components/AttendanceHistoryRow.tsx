import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { AttendanceStatusIcon } from '@/features/attendance/components/AttendanceStatusIcon';
import type { AttendanceHistoryRecord } from '@/features/attendance/services/attendanceService';
import {
  formatAttendanceDuration,
  formatAttendanceShortDate,
  formatAttendanceTime,
} from '@/features/attendance/utils/attendanceDateTime';

type AttendanceHistoryRowProps = {
  record: AttendanceHistoryRecord;
};

export function AttendanceHistoryRow({ record }: AttendanceHistoryRowProps) {
  const duration = formatAttendanceDuration(
    record.checkInTime,
    record.checkOutTime,
  );
  const statusLabel =
    record.status === 'checked_out' ? 'Completed' : 'In progress';

  return (
    <View style={styles.row}>
      <AttendanceStatusIcon size="small" status={record.status} />
      <View style={styles.copy}>
        <AppText variant="labelStrong">
          {formatAttendanceShortDate(record.date)}
        </AppText>
        <AppText color="textSecondary" variant="body">
          {`${formatAttendanceTime(record.checkInTime)} \u2013 ${formatAttendanceTime(record.checkOutTime)}`}
        </AppText>
        <AppText color="textSecondary" variant="caption">
          {record.status === 'checked_out' && duration
            ? `${duration} \u00B7 ${statusLabel}`
            : statusLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
});
