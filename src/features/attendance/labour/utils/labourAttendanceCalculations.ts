import type {
  LabourAttendanceDraft,
  LabourAttendanceStatus,
  LabourRecord,
  LabourTodayAttendance,
} from '@/features/attendance/labour/services/labourAttendanceService';

export function calculateEstimatedAttendanceAmount(
  hours: number,
  overtimeHours: number,
  rate: number,
) {
  return (hours / 8) * rate + overtimeHours * (rate / 8);
}

export function formatPkrAmount(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
}

export function getEffectiveAttendanceStatus(
  draft: LabourAttendanceDraft | undefined,
  savedAttendance: LabourTodayAttendance | null,
): LabourAttendanceStatus | null {
  return draft?.status ?? savedAttendance?.status ?? null;
}

export function getEffectiveHours(
  draft: LabourAttendanceDraft | undefined,
  savedAttendance: LabourTodayAttendance | null,
) {
  if (draft) {
    return draft.hours;
  }

  return savedAttendance ? Number(savedAttendance.hours) : 0;
}

export function getEffectiveOvertimeHours(
  draft: LabourAttendanceDraft | undefined,
  savedAttendance: LabourTodayAttendance | null,
) {
  if (draft) {
    return draft.overtimeHours;
  }

  return savedAttendance ? Number(savedAttendance.overtimeHours) : 0;
}

export function getDailyWageNumber(labour: LabourRecord) {
  return Number(labour.dailyWage);
}
