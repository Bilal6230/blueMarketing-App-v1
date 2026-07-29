import {
  labourSeedRecords,
  labourSeedSites,
  labourSeedTodayAttendance,
  type LabourSeedRecord,
} from '@/features/attendance/labour/data/labourAttendanceSeed';

export type LabourRecordState = 'active' | 'inactive';

export type LabourAttendanceStatus = 'present' | 'absent';

export type LabourTodayAttendance = {
  status: LabourAttendanceStatus;
  hours: string;
  overtimeHours: string;
};

export type LabourRecord = {
  id: number;
  name: string;
  fatherName: string | null;
  maskedPhone: string | null;
  role: string | null;
  dailyWage: string;
  todayAttendance: LabourTodayAttendance | null;
};

export type LabourSite = {
  id: number;
  name: string;
};

export type LabourListFilters = {
  projectId: number;
  siteId?: number;
  search?: string;
  recordState?: LabourRecordState;
  page?: number;
  perPage?: number;
};

export type LabourAttendanceDraft = {
  labourId: number;
  status: LabourAttendanceStatus | null;
  hours: number;
  overtimeHours: number;
  rate: number;
  remarks: string;
  rating: number | null;
  isDirty: boolean;
};

export type MarkLabourAttendanceInput = {
  projectId: number;
  siteId: number | null;
  date: string;
  records: {
    labourId: number;
    status: LabourAttendanceStatus;
    hours: number;
    overtimeHours: number;
    rate: number;
    remarks?: string;
    rating?: number;
  }[];
};

export type MarkLabourAttendanceResult = {
  created: number;
  updated: number;
  date: string;
};

export type LabourListMeta = {
  currentPage: number;
  date: string;
  lastPage: number;
  perPage: number;
  selectedProjectId: number;
  selectedSiteId: number | null;
  total: number;
};

export type LabourListResult = {
  meta: LabourListMeta;
  records: LabourRecord[];
};

type PersistedLabourAttendance = LabourTodayAttendance & {
  amount: number;
  rate: number;
  rating: number | null;
  remarks: string;
};

const NETWORK_DELAY_MS = 140;
const TODAY = '2026-07-29';

let persistedAttendance = new Map<string, PersistedLabourAttendance>(
  Object.entries(labourSeedTodayAttendance).map(([key, value]) => [
    key,
    {
      ...value,
      amount: 0,
      rate: 0,
      rating: null,
      remarks: '',
    },
  ]),
);

function delay() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
}

function createServiceError(message: string) {
  const error = new Error(message);
  error.name = 'LabourAttendanceServiceError';
  return error;
}

function getAttendanceKey(
  projectId: number,
  siteId: number,
  labourId: number,
  date: string = TODAY,
) {
  return `${projectId}:${siteId}:${labourId}:${date}`;
}

function getSeedAttendanceKey(projectId: number, siteId: number, labourId: number) {
  return `${projectId}:${siteId}:${labourId}`;
}

function normalizeSeedAttendance() {
  const next = new Map<string, PersistedLabourAttendance>();

  for (const [key, value] of Object.entries(labourSeedTodayAttendance)) {
    const [projectId = 0, siteId = 0, labourId = 0] = key
      .split(':')
      .map(Number);
    const labour = labourSeedRecords.find(
      (item) => item.id === labourId && item.projectId === projectId,
    );
    const rate = Number(labour?.dailyWage ?? 0);

    next.set(getAttendanceKey(projectId, siteId, labourId), {
      ...value,
      amount: calculateServerAmount(
        Number(value.hours),
        Number(value.overtimeHours),
        rate,
      ),
      rate,
      rating: null,
      remarks: '',
    });
  }

  return next;
}

function calculateServerAmount(hours: number, overtimeHours: number, rate: number) {
  return (hours / 8) * rate + overtimeHours * (rate / 8);
}

function getMaskedSearchValue(labour: LabourSeedRecord) {
  return [
    labour.name,
    labour.fatherName ?? '',
    labour.role ?? '',
    labour.maskedPhone ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

function mapToLabourRecord(
  labour: LabourSeedRecord,
  siteId?: number,
): LabourRecord {
  const resolvedSiteId = siteId ?? null;
  const seedAttendanceKey =
    resolvedSiteId === null
      ? null
      : getSeedAttendanceKey(labour.projectId, resolvedSiteId, labour.id);
  const seedAttendance =
    seedAttendanceKey === null
      ? null
      : labourSeedTodayAttendance[seedAttendanceKey] ?? null;
  const attendance =
    resolvedSiteId === null
      ? null
      : persistedAttendance.get(
          getAttendanceKey(labour.projectId, resolvedSiteId, labour.id),
        ) ??
        (seedAttendance
          ? {
              ...seedAttendance,
              amount: 0,
              rate: Number(labour.dailyWage),
              rating: null,
              remarks: '',
            }
          : null);

  return {
    dailyWage: labour.dailyWage,
    fatherName: labour.fatherName,
    id: labour.id,
    maskedPhone: labour.maskedPhone,
    name: labour.name,
    role: labour.role,
    todayAttendance: attendance
      ? {
          hours: attendance.hours,
          overtimeHours: attendance.overtimeHours,
          status: attendance.status,
        }
      : null,
  };
}

export async function getLabourSites(projectId: number): Promise<LabourSite[]> {
  await delay();

  return [...(labourSeedSites[projectId as keyof typeof labourSeedSites] ?? [])];
}

export async function getLabours(
  filters: LabourListFilters,
): Promise<LabourListResult> {
  await delay();

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const search = filters.search?.trim().toLowerCase() ?? '';
  const recordState = filters.recordState ?? 'active';
  const filtered = labourSeedRecords
    .filter((labour) => labour.projectId === filters.projectId)
    .filter((labour) => labour.recordState === recordState)
    .filter((labour) =>
      search.length === 0 ? true : getMaskedSearchValue(labour).includes(search),
    );
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const offset = (page - 1) * perPage;

  return {
    meta: {
      currentPage: page,
      date: TODAY,
      lastPage,
      perPage,
      selectedProjectId: filters.projectId,
      selectedSiteId: filters.siteId ?? null,
      total,
    },
    records: filtered
      .slice(offset, offset + perPage)
      .map((labour) => mapToLabourRecord(labour, filters.siteId)),
  };
}

export async function markLabourAttendance(
  input: MarkLabourAttendanceInput,
): Promise<MarkLabourAttendanceResult> {
  await delay();

  if (!input.siteId) {
    throw createServiceError('Select a site before saving attendance.');
  }

  if (input.date !== TODAY) {
    throw createServiceError("Only today's labour attendance can be saved.");
  }

  if (input.records.length === 0) {
    throw createServiceError('Select at least one labourer to save attendance.');
  }

  const seen = new Set<number>();

  for (const record of input.records) {
    if (seen.has(record.labourId)) {
      throw createServiceError(
        'Attendance for one or more labourers is duplicated.',
      );
    }

    seen.add(record.labourId);
  }

  let created = 0;
  let updated = 0;

  for (const record of input.records) {
    const labour = labourSeedRecords.find(
      (item) =>
        item.id === record.labourId && item.projectId === input.projectId,
    );

    if (!labour) {
      throw createServiceError('One or more labourers could not be found.');
    }

    const key = getAttendanceKey(input.projectId, input.siteId, record.labourId);
    const existing = persistedAttendance.get(key);

    if (
      record.status === 'present' &&
      (record.hours < 0 ||
        record.hours > 24 ||
        record.overtimeHours < 0 ||
        record.overtimeHours > 24 ||
        record.rate < 0)
    ) {
      throw createServiceError('Working details are outside the allowed range.');
    }

    persistedAttendance.set(key, {
      amount: calculateServerAmount(
        record.hours,
        record.overtimeHours,
        record.rate,
      ),
      hours: String(record.hours),
      overtimeHours: String(record.overtimeHours),
      rate: record.rate,
      rating: record.rating ?? null,
      remarks: record.remarks?.trim() ?? '',
      status: record.status,
    });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return {
    created,
    date: TODAY,
    updated,
  };
}

export function getLabourTodayDate() {
  return TODAY;
}

export function __resetLabourAttendanceServiceData() {
  persistedAttendance = normalizeSeedAttendance();
}

__resetLabourAttendanceServiceData();
