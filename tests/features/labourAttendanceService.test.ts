import {
  __resetLabourAttendanceServiceData,
  getLabourTodayDate,
  getLabours,
  markLabourAttendance,
} from '@/features/attendance/labour/services/labourAttendanceService';
import { calculateEstimatedAttendanceAmount } from '@/features/attendance/labour/utils/labourAttendanceCalculations';

async function flushDelay() {
  await jest.advanceTimersByTimeAsync(160);
}

describe('labourAttendanceService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
    __resetLabourAttendanceServiceData();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('searches by name, father name, role, and masked phone', async () => {
    const namePromise = getLabours({ projectId: 101, search: 'Muhammad' });
    const fatherPromise = getLabours({ projectId: 101, search: 'Rashid' });
    const rolePromise = getLabours({ projectId: 101, search: 'Electrician' });
    const phonePromise = getLabours({ projectId: 101, search: '03******42' });

    await flushDelay();

    await expect(namePromise).resolves.toMatchObject({
      records: [expect.objectContaining({ name: 'Muhammad Ali' })],
    });
    await expect(fatherPromise).resolves.toMatchObject({
      records: [expect.objectContaining({ fatherName: 'Rashid' })],
    });
    await expect(rolePromise).resolves.toMatchObject({
      records: [expect.objectContaining({ role: 'Electrician' })],
    });
    await expect(phonePromise).resolves.toMatchObject({
      records: [expect.objectContaining({ maskedPhone: '03******42' })],
    });
  });

  it('returns active labour by default, keeps phones masked, and pre-fills today attendance for a selected site', async () => {
    const promise = getLabours({
      projectId: 101,
      siteId: 1002,
    });

    await flushDelay();

    const result = await promise;

    expect(result.records.every((item) => !item.maskedPhone?.includes('1234567'))).toBe(true);
    expect(result.records.find((item) => item.id === 18)).toBeUndefined();
    expect(result.records.find((item) => item.id === 1)?.todayAttendance).toEqual({
      hours: '8',
      overtimeHours: '0',
      status: 'present',
    });
  });

  it('derives today from the system clock for list metadata and save validation', async () => {
    const listPromise = getLabours({
      projectId: 101,
      siteId: 1002,
    });

    await flushDelay();

    await expect(listPromise).resolves.toMatchObject({
      meta: { date: '2026-07-29' },
    });
    expect(getLabourTodayDate()).toBe('2026-07-29');

    jest.setSystemTime(new Date('2026-07-30T08:56:00'));

    const staleDatePromise = markLabourAttendance({
      date: '2026-07-29',
      projectId: 101,
      records: [
        {
          hours: 8,
          labourId: 3,
          overtimeHours: 0,
          rate: 2100,
          status: 'present',
        },
      ],
      siteId: 1002,
    });

    const staleDateAssertion = expect(staleDatePromise).rejects.toThrow(
      "Only today's labour attendance can be saved.",
    );
    await flushDelay();
    await staleDateAssertion;
  });

  it('uses the backend estimate formula and rejects duplicated attendance records', async () => {
    expect(calculateEstimatedAttendanceAmount(8, 2, 2500)).toBe(3125);

    const promise = markLabourAttendance({
      date: getLabourTodayDate(),
      projectId: 101,
      records: [
        {
          hours: 8,
          labourId: 3,
          overtimeHours: 0,
          rate: 2100,
          status: 'present',
        },
        {
          hours: 8,
          labourId: 3,
          overtimeHours: 0,
          rate: 2100,
          status: 'present',
        },
      ],
      siteId: 1002,
    });
    const assertion = expect(promise).rejects.toThrow(
      'Attendance for one or more labourers is duplicated.',
    );

    await flushDelay();
    await assertion;
  });

  it('rejects non-finite numeric attendance values', async () => {
    const promise = markLabourAttendance({
      date: getLabourTodayDate(),
      projectId: 101,
      records: [
        {
          hours: Number.NaN,
          labourId: 3,
          overtimeHours: 0,
          rate: 2100,
          status: 'present',
        },
      ],
      siteId: 1002,
    });

    const assertion = expect(promise).rejects.toThrow(
      'Working details are outside the allowed range.',
    );
    await flushDelay();
    await assertion;
  });
});
