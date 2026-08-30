import { act } from '@testing-library/react-native';

import * as labourService from '@/features/attendance/labour/services/labourAttendanceService';
import {
  useLabourAttendanceStore,
} from '@/features/attendance/labour/store/labourAttendanceStore';
import {
  labourAttendanceListContentStyle,
} from '@/features/attendance/labour/screens/LabourAttendanceScreen';

async function flushDelay() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(420);
  });
}

describe('labourAttendanceStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-29T08:56:00'));
    labourService.__resetLabourAttendanceServiceData();
    useLabourAttendanceStore.getState().resetLabourAttendanceState();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('defaults present to 8 hours and zero overtime, and absent to zero hours', async () => {
    const loadPromise = useLabourAttendanceStore.getState().loadLabours({
      projectId: 101,
      recordState: useLabourAttendanceStore.getState().recordStateFilter,
      siteId: 1002,
    });

    await flushDelay();
    await loadPromise;

    useLabourAttendanceStore.getState().markPresent(3);
    expect(useLabourAttendanceStore.getState().drafts[3]).toMatchObject({
      hours: 8,
      overtimeHours: 0,
      status: 'present',
    });

    useLabourAttendanceStore.getState().markAbsent(4);
    expect(useLabourAttendanceStore.getState().drafts[4]).toMatchObject({
      hours: 0,
      overtimeHours: 0,
      status: 'absent',
    });
  });

  it('preserves drafts across search and pagination and does not overwrite explicit drafts with mark all present', async () => {
    const loadPromise = useLabourAttendanceStore.getState().loadLabours({
      page: 1,
      perPage: 100,
      projectId: 101,
      recordState: 'active',
      siteId: 1002,
    });

    await flushDelay();
    await loadPromise;

    useLabourAttendanceStore.getState().markAbsent(3);
    useLabourAttendanceStore.getState().markAllVisiblePresent();

    expect(useLabourAttendanceStore.getState().drafts[3]?.status).toBe('absent');
    expect(useLabourAttendanceStore.getState().drafts[4]?.status).toBe('present');

    useLabourAttendanceStore.getState().setSearch('Ali');
    const filteredLoad = useLabourAttendanceStore.getState().loadLabours({
      page: 1,
      perPage: 100,
      projectId: 101,
      recordState: 'active',
      search: 'Ali',
      siteId: 1002,
    });

    await flushDelay();
    await filteredLoad;

    expect(useLabourAttendanceStore.getState().drafts[3]?.status).toBe('absent');

    useLabourAttendanceStore.getState().setSearch('');
    const reload = useLabourAttendanceStore.getState().loadLabours({
      page: 1,
      perPage: 100,
      projectId: 101,
      recordState: 'active',
      siteId: 1002,
    });

    await flushDelay();
    await reload;

    const loadMore = useLabourAttendanceStore.getState().loadMoreLabours();

    await flushDelay();
    await loadMore;

    expect(useLabourAttendanceStore.getState().drafts[3]?.status).toBe('absent');
    expect(useLabourAttendanceStore.getState().labours.length).toBeGreaterThan(12);
  });

  it('submits multiple marked labourers in one request and excludes estimated amount from the payload', async () => {
    const markSpy = jest.spyOn(labourService, 'markLabourAttendance');
    const loadPromise = useLabourAttendanceStore.getState().loadLabours({
      projectId: 101,
      recordState: 'active',
      siteId: 1002,
    });

    await flushDelay();
    await loadPromise;

    useLabourAttendanceStore.getState().markPresent(3);
    useLabourAttendanceStore.getState().updateDraft(3, {
      hours: 4,
      overtimeHours: 2,
      rate: 2500,
      status: 'present',
    });
    useLabourAttendanceStore.getState().markAbsent(4);

    const savePromise = useLabourAttendanceStore.getState().saveAttendance(101, 1002);

    await flushDelay();
    const result = await savePromise;

    expect(result).toEqual({ created: 2, updated: 0 });
    expect(markSpy).toHaveBeenCalledTimes(1);
    expect(markSpy.mock.calls[0]?.[0]).toEqual({
      date: '2026-07-29',
      projectId: 101,
      records: [
        {
          hours: 4,
          labourId: 3,
          overtimeHours: 2,
          rate: 2500,
          remarks: undefined,
          rating: undefined,
          status: 'present',
        },
        {
          hours: 0,
          labourId: 4,
          overtimeHours: 0,
          rate: 0,
          remarks: undefined,
          rating: undefined,
          status: 'absent',
        },
      ],
      siteId: 1002,
    });
    expect(JSON.stringify(markSpy.mock.calls[0]?.[0] ?? {})).not.toContain('amount');
    expect(useLabourAttendanceStore.getState().successMessage).toBe(
      'Attendance saved. 2 created, 0 updated.',
    );
  });

  it('keeps drafts after duplicate save errors and uses a small natural list gap before the save bar', async () => {
    jest.spyOn(labourService, 'markLabourAttendance').mockRejectedValue(
      new Error('Attendance for one or more labourers is duplicated.'),
    );

    const loadPromise = useLabourAttendanceStore.getState().loadLabours({
      projectId: 101,
      recordState: 'active',
      siteId: 1002,
    });

    await flushDelay();
    await loadPromise;

    useLabourAttendanceStore.getState().markPresent(3);
    const savePromise = useLabourAttendanceStore.getState().saveAttendance(101, 1002);

    await flushDelay();
    await expect(savePromise).resolves.toBeNull();
    expect(useLabourAttendanceStore.getState().drafts[3]?.status).toBe('present');
    expect(useLabourAttendanceStore.getState().saveError).toBe(
      'Attendance for one or more labourers is duplicated.',
    );
    expect(labourAttendanceListContentStyle).toEqual({
      gap: 12,
      paddingBottom: 8,
    });
  });
});
