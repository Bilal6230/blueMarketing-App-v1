import { act } from '@testing-library/react-native';

import { __resetAttendanceServiceData } from '@/features/attendance/services/attendanceService';
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore';
import { buildAttendanceHistoryPresetRange } from '@/features/attendance/utils/historyPresets';
import {
  attendanceHistoryContentContainerStyle,
  attendanceHistoryListContentStyle,
} from '@/features/attendance/screens/AttendanceHistoryScreen';
import { attendanceScreenContentContainerStyle } from '@/features/attendance/screens/AttendanceScreen';

async function flushServiceDelay() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(400);
  });
}

describe('attendanceStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
    __resetAttendanceServiceData();
    useAttendanceStore.getState().resetAttendanceState();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('prevents duplicate submissions and keeps the service response as source of truth', async () => {
    const firstSubmission = useAttendanceStore.getState().submitCheckIn(101);
    const secondSubmission = useAttendanceStore.getState().submitCheckIn(101);

    await expect(secondSubmission).resolves.toBeNull();

    await flushServiceDelay();
    await expect(firstSubmission).resolves.toEqual({
      canCheckIn: false,
      canCheckOut: true,
      checkInTime: '2026-07-29 08:56:00',
      checkOutTime: null,
      date: '2026-07-29',
      status: 'checked_in',
    });
    expect(useAttendanceStore.getState().todayAttendance?.checkInTime).toBe(
      '2026-07-29 08:56:00',
    );
  });

  it('does not allow check-out before check-in', async () => {
    const resultPromise = useAttendanceStore.getState().submitCheckOut();

    await flushServiceDelay();

    await expect(resultPromise).resolves.toBeNull();
    expect(useAttendanceStore.getState().todayError).toBe(
      'You must check in before checking out.',
    );
  });

  it('loads paginated history and appends more records', async () => {
    const loadPromise = useAttendanceStore.getState().loadHistory({
      page: 1,
      perPage: 5,
      projectId: 101,
    });

    await flushServiceDelay();
    await loadPromise;

    expect(useAttendanceStore.getState().history).toHaveLength(5);
    expect(useAttendanceStore.getState().historyMeta?.currentPage).toBe(1);

    const loadMorePromise = useAttendanceStore.getState().loadMoreHistory();

    await flushServiceDelay();
    await loadMorePromise;

    expect(useAttendanceStore.getState().history).toHaveLength(10);
    expect(useAttendanceStore.getState().historyMeta?.currentPage).toBe(2);
    expect(useAttendanceStore.getState().history[9]?.date).toBe('2026-07-19');
  });

  it('builds the expected date preset filters and keeps scoped footer spacing', () => {
    expect(
      buildAttendanceHistoryPresetRange(
        'last_7_days',
        new Date('2026-07-29T08:56:00'),
      ),
    ).toEqual({
      dateFrom: '2026-07-23',
      dateTo: '2026-07-29',
    });
    expect(
      buildAttendanceHistoryPresetRange(
        'last_30_days',
        new Date('2026-07-29T08:56:00'),
      ),
    ).toEqual({
      dateFrom: '2026-06-30',
      dateTo: '2026-07-29',
    });
    expect(
      buildAttendanceHistoryPresetRange(
        'this_month',
        new Date('2026-07-29T08:56:00'),
      ),
    ).toEqual({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-29',
    });
    expect(attendanceScreenContentContainerStyle).toEqual({
      paddingBottom: 16,
    });
    expect(attendanceHistoryContentContainerStyle).toEqual({
      paddingBottom: 0,
    });
    expect(attendanceHistoryListContentStyle).toEqual({
      gap: 10,
      paddingBottom: 8,
    });
  });
});
