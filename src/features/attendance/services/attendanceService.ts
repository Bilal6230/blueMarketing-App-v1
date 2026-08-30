import {
  compareAttendanceDateTime,
  formatServerDate,
  formatServerDateTime,
} from '@/features/attendance/utils/attendanceDateTime';

export type StaffAttendanceStatus =
  'not_checked_in' | 'checked_in' | 'checked_out';

export type TodayAttendance = {
  date: string;
  status: StaffAttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
};

export type AttendanceHistoryRecord = {
  id: number;
  projectId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'checked_in' | 'checked_out';
};

export type AttendanceHistoryMeta = {
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
  selectedProjectId: number | null;
};

export type AttendanceHistoryResult = {
  records: AttendanceHistoryRecord[];
  meta: AttendanceHistoryMeta;
};

export type AttendanceHistoryFilters = {
  projectId: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
};

export type StaffCheckInInput = {
  projectId: number;
};

const NETWORK_DELAY_MS = 120;

const seedHistoryRecords: AttendanceHistoryRecord[] = [
  {
    checkInTime: '2026-07-28 08:52:00',
    checkOutTime: '2026-07-28 18:06:00',
    date: '2026-07-28',
    id: 2801,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-27 08:58:00',
    checkOutTime: '2026-07-27 18:01:00',
    date: '2026-07-27',
    id: 2701,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-26 09:05:00',
    checkOutTime: '2026-07-26 18:11:00',
    date: '2026-07-26',
    id: 2601,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-25 08:49:00',
    checkOutTime: '2026-07-25 17:54:00',
    date: '2026-07-25',
    id: 2501,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-24 08:56:00',
    checkOutTime: '2026-07-24 18:04:00',
    date: '2026-07-24',
    id: 2401,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-23 08:55:00',
    checkOutTime: '2026-07-23 18:00:00',
    date: '2026-07-23',
    id: 2301,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-22 09:07:00',
    checkOutTime: '2026-07-22 18:10:00',
    date: '2026-07-22',
    id: 2201,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-21 08:57:00',
    checkOutTime: '2026-07-21 18:03:00',
    date: '2026-07-21',
    id: 2101,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-20 08:54:00',
    checkOutTime: '2026-07-20 18:07:00',
    date: '2026-07-20',
    id: 2001,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-19 09:01:00',
    checkOutTime: '2026-07-19 18:08:00',
    date: '2026-07-19',
    id: 1901,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-18 08:53:00',
    checkOutTime: '2026-07-18 18:05:00',
    date: '2026-07-18',
    id: 1801,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-17 08:59:00',
    checkOutTime: '2026-07-17 18:02:00',
    date: '2026-07-17',
    id: 1701,
    projectId: 101,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-16 08:50:00',
    checkOutTime: '2026-07-16 17:58:00',
    date: '2026-07-16',
    id: 1602,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-15 09:02:00',
    checkOutTime: '2026-07-15 18:14:00',
    date: '2026-07-15',
    id: 1502,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-14 08:48:00',
    checkOutTime: '2026-07-14 18:00:00',
    date: '2026-07-14',
    id: 1402,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-13 08:51:00',
    checkOutTime: '2026-07-13 17:55:00',
    date: '2026-07-13',
    id: 1302,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-12 08:47:00',
    checkOutTime: '2026-07-12 17:49:00',
    date: '2026-07-12',
    id: 1202,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-11 08:57:00',
    checkOutTime: '2026-07-11 18:03:00',
    date: '2026-07-11',
    id: 1102,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-10 08:56:00',
    checkOutTime: '2026-07-10 18:01:00',
    date: '2026-07-10',
    id: 1002,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-09 08:58:00',
    checkOutTime: '2026-07-09 18:06:00',
    date: '2026-07-09',
    id: 902,
    projectId: 102,
    status: 'checked_out',
  },
  {
    checkInTime: '2026-07-08 08:46:00',
    checkOutTime: '2026-07-08 17:52:00',
    date: '2026-07-08',
    id: 802,
    projectId: 102,
    status: 'checked_out',
  },
];

let records = seedHistoryRecords.map((record) => ({ ...record }));
let nextRecordId = 5000;

function delay() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
}

function createApiError(message: string) {
  const error = new Error(message);
  error.name = 'AttendanceServiceError';
  return error;
}

function sortNewestFirst(
  left: AttendanceHistoryRecord,
  right: AttendanceHistoryRecord,
) {
  return compareAttendanceDateTime(right.checkInTime, left.checkInTime);
}

function getTodayRecord() {
  const today = formatServerDate(new Date());

  return records.find((record) => record.date === today) ?? null;
}

function toTodayAttendance(
  record: AttendanceHistoryRecord | null,
): TodayAttendance {
  const date = formatServerDate(new Date());

  if (!record) {
    return {
      canCheckIn: true,
      canCheckOut: false,
      checkInTime: null,
      checkOutTime: null,
      date,
      status: 'not_checked_in',
    };
  }

  if (record.status === 'checked_in') {
    return {
      canCheckIn: false,
      canCheckOut: true,
      checkInTime: record.checkInTime,
      checkOutTime: null,
      date: record.date,
      status: 'checked_in',
    };
  }

  return {
    canCheckIn: false,
    canCheckOut: false,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    date: record.date,
    status: 'checked_out',
  };
}

export async function getTodayAttendance(
  _projectId: number,
): Promise<TodayAttendance> {
  await delay();

  return toTodayAttendance(getTodayRecord());
}

export async function checkIn(
  input: StaffCheckInInput,
): Promise<TodayAttendance> {
  await delay();

  const existingRecord = getTodayRecord();

  if (existingRecord?.status === 'checked_in') {
    throw createApiError('You have already checked in for today.');
  }

  if (existingRecord?.status === 'checked_out') {
    throw createApiError('You have already completed attendance for today.');
  }

  const now = new Date();
  const nextRecord: AttendanceHistoryRecord = {
    checkInTime: formatServerDateTime(now),
    checkOutTime: null,
    date: formatServerDate(now),
    id: nextRecordId,
    projectId: input.projectId,
    status: 'checked_in',
  };

  nextRecordId += 1;
  records = [nextRecord, ...records].sort(sortNewestFirst);

  return toTodayAttendance(nextRecord);
}

export async function checkOut(): Promise<TodayAttendance> {
  await delay();

  const existingRecord = getTodayRecord();

  if (!existingRecord) {
    throw createApiError('You must check in before checking out.');
  }

  if (existingRecord.status === 'checked_out') {
    throw createApiError('You have already completed attendance for today.');
  }

  const now = new Date();
  const updatedRecord: AttendanceHistoryRecord = {
    ...existingRecord,
    checkOutTime: formatServerDateTime(now),
    status: 'checked_out',
  };

  records = records
    .map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
    .sort(sortNewestFirst);

  return toTodayAttendance(updatedRecord);
}

export async function getAttendanceHistory(
  filters: AttendanceHistoryFilters,
): Promise<AttendanceHistoryResult> {
  await delay();

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 10;
  const filteredRecords = records
    .filter((record) => record.projectId === filters.projectId)
    .filter((record) =>
      filters.dateFrom ? record.date >= filters.dateFrom : true,
    )
    .filter((record) => (filters.dateTo ? record.date <= filters.dateTo : true))
    .sort(sortNewestFirst);
  const total = filteredRecords.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;

  return {
    meta: {
      currentPage: page,
      lastPage,
      perPage,
      selectedProjectId: filters.projectId,
      total,
    },
    records: filteredRecords.slice(startIndex, startIndex + perPage),
  };
}

export function __resetAttendanceServiceData() {
  records = seedHistoryRecords.map((record) => ({ ...record }));
  nextRecordId = 5000;
}
