import { create } from 'zustand';

import {
  createAttendanceSummary,
  type AttendanceSummary,
} from '@/features/attendance/services/attendanceService';

type AttendanceState = {
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  checkIn: () => { ok: true; time: Date } | { ok: false };
  checkOut: () => { ok: true; time: Date } | { ok: false };
  getSummary: (projectName: string) => AttendanceSummary;
  resetToday: () => void;
};

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  checkedInAt: null,
  checkedOutAt: null,
  checkIn: () => {
    const state = get();

    if (state.checkedInAt) {
      return { ok: false };
    }

    const now = new Date();
    set({ checkedInAt: now, checkedOutAt: null });
    return { ok: true, time: now };
  },
  checkOut: () => {
    const state = get();

    if (!state.checkedInAt || state.checkedOutAt) {
      return { ok: false };
    }

    const now = new Date();
    set({ checkedOutAt: now });
    return { ok: true, time: now };
  },
  getSummary: (projectName) =>
    createAttendanceSummary({
      checkedInAt: get().checkedInAt,
      checkedOutAt: get().checkedOutAt,
      projectName,
    }),
  resetToday: () => set({ checkedInAt: null, checkedOutAt: null }),
}));
