import { formatServerDate } from '@/features/attendance/utils/attendanceDateTime';

export type AttendanceHistoryPreset =
  'all' | 'last_7_days' | 'last_30_days' | 'this_month';

export function buildAttendanceHistoryPresetRange(
  preset: AttendanceHistoryPreset,
  now: Date = new Date(),
) {
  if (preset === 'all') {
    return {
      dateFrom: undefined,
      dateTo: undefined,
    };
  }

  if (preset === 'this_month') {
    return {
      dateFrom: formatServerDate(
        new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      ),
      dateTo: formatServerDate(now),
    };
  }

  const days = preset === 'last_7_days' ? 6 : 29;
  const fromDate = new Date(now);

  fromDate.setDate(now.getDate() - days);

  return {
    dateFrom: formatServerDate(fromDate),
    dateTo: formatServerDate(now),
  };
}
