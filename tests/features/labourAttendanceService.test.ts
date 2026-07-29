import {
  __resetLabourAttendanceServiceData,
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

  it('uses the backend estimate formula and rejects duplicated attendance records', async () => {
    expect(calculateEstimatedAttendanceAmount(8, 2, 2500)).toBe(3125);

    const promise = markLabourAttendance({
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
});
