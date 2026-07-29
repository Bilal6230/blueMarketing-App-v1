import {
  __resetAttendanceServiceData,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayAttendance,
} from '@/features/attendance/services/attendanceService';
import {
  formatAttendanceDuration,
  parseAttendanceDateTime,
} from '@/features/attendance/utils/attendanceDateTime';

async function flushServiceDelay() {
  await jest.advanceTimersByTimeAsync(150);
}

describe('attendanceService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
    __resetAttendanceServiceData();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a not-checked-in state by default', async () => {
    const promise = getTodayAttendance(101);

    await flushServiceDelay();

    await expect(promise).resolves.toEqual({
      canCheckIn: true,
      canCheckOut: false,
      checkInTime: null,
      checkOutTime: null,
      date: '2026-07-29',
      status: 'not_checked_in',
    });
  });

  it('uses the service timestamp for check-in and prevents duplicate check-in', async () => {
    const checkInPromise = checkIn({ projectId: 101 });

    await flushServiceDelay();

    await expect(checkInPromise).resolves.toEqual({
      canCheckIn: false,
      canCheckOut: true,
      checkInTime: '2026-07-29 08:56:00',
      checkOutTime: null,
      date: '2026-07-29',
      status: 'checked_in',
    });

    const duplicatePromise = checkIn({ projectId: 101 });
    const duplicateAssertion = expect(duplicatePromise).rejects.toThrow(
      'You have already checked in for today.',
    );

    await flushServiceDelay();
    await duplicateAssertion;
  });

  it('does not allow check-out before check-in', async () => {
    const promise = checkOut();
    const assertion = expect(promise).rejects.toThrow(
      'You must check in before checking out.',
    );

    await flushServiceDelay();
    await assertion;
  });

  it('completes attendance once and derives duration from timestamps', async () => {
    const checkInPromise = checkIn({ projectId: 101 });

    await flushServiceDelay();
    await checkInPromise;

    jest.setSystemTime(new Date('2026-07-29T18:04:00'));

    const checkOutPromise = checkOut();

    await flushServiceDelay();

    const checkedOut = await checkOutPromise;

    expect(checkedOut).toEqual({
      canCheckIn: false,
      canCheckOut: false,
      checkInTime: '2026-07-29 08:56:00',
      checkOutTime: '2026-07-29 18:04:00',
      date: '2026-07-29',
      status: 'checked_out',
    });
    expect(
      formatAttendanceDuration(checkedOut.checkInTime, checkedOut.checkOutTime),
    ).toBe('09h 08m');

    const secondCheckOutPromise = checkOut();
    const secondCheckOutAssertion = expect(
      secondCheckOutPromise,
    ).rejects.toThrow('You have already completed attendance for today.');

    await flushServiceDelay();
    await secondCheckOutAssertion;
  });

  it('parses backend datetime strings as local time and paginates newest-first history', async () => {
    const parsed = parseAttendanceDateTime('2026-07-29 08:56:00');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(6);
    expect(parsed?.getDate()).toBe(29);
    expect(parsed?.getHours()).toBe(8);
    expect(parsed?.getMinutes()).toBe(56);

    const historyPromise = getAttendanceHistory({
      page: 2,
      perPage: 5,
      projectId: 101,
    });

    await flushServiceDelay();

    const history = await historyPromise;

    expect(history.meta).toEqual({
      currentPage: 2,
      lastPage: 3,
      perPage: 5,
      selectedProjectId: 101,
      total: 12,
    });
    expect(history.records).toHaveLength(5);
    expect(history.records[0]?.date).toBe('2026-07-23');
    expect(history.records[4]?.date).toBe('2026-07-19');
  });
});
