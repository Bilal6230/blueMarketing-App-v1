import { create } from 'zustand';

import {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayAttendance,
  type AttendanceHistoryFilters,
  type AttendanceHistoryMeta,
  type AttendanceHistoryRecord,
  type TodayAttendance,
} from '@/features/attendance/services/attendanceService';

type AttendanceState = {
  currentHistoryFilters: AttendanceHistoryFilters | null;
  currentProjectId: number | null;
  history: AttendanceHistoryRecord[];
  historyError: string | null;
  historyMeta: AttendanceHistoryMeta | null;
  isLoadingHistory: boolean;
  isLoadingMoreHistory: boolean;
  isLoadingToday: boolean;
  isSubmitting: boolean;
  loadHistory: (filters: AttendanceHistoryFilters) => Promise<void>;
  loadMoreHistory: (filters?: AttendanceHistoryFilters) => Promise<void>;
  loadTodayAttendance: (projectId: number) => Promise<void>;
  resetAttendanceState: () => void;
  submitCheckIn: (projectId: number) => Promise<TodayAttendance | null>;
  submitCheckOut: () => Promise<TodayAttendance | null>;
  todayAttendance: TodayAttendance | null;
  todayError: string | null;
  todayProjectId: number | null;
};

const initialState = {
  currentHistoryFilters: null,
  currentProjectId: null,
  history: [],
  historyError: null,
  historyMeta: null,
  isLoadingHistory: false,
  isLoadingMoreHistory: false,
  isLoadingToday: false,
  isSubmitting: false,
  todayAttendance: null,
  todayError: null,
  todayProjectId: null,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Attendance could not be loaded.';
}

function normalizeHistoryFilters(filters: AttendanceHistoryFilters) {
  return {
    ...filters,
    page: filters.page ?? 1,
    perPage: filters.perPage ?? 10,
  };
}

async function refreshHistorySlice(
  state: AttendanceState,
  set: (
    partial:
      | Partial<AttendanceState>
      | ((current: AttendanceState) => Partial<AttendanceState>),
  ) => void,
  filtersOverride?: AttendanceHistoryFilters | null,
) {
  const baseFilters = filtersOverride ?? state.currentHistoryFilters;

  if (!baseFilters) {
    return;
  }

  const loadedPages = state.historyMeta?.currentPage ?? 1;
  const perPage = baseFilters.perPage ?? state.historyMeta?.perPage ?? 10;
  const result = await getAttendanceHistory({
    ...baseFilters,
    page: 1,
    perPage: loadedPages * perPage,
  });

  set({
    currentHistoryFilters: {
      ...baseFilters,
      page: 1,
      perPage,
    },
    history: result.records,
    historyMeta: result.meta,
  });
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  ...initialState,
  loadHistory: async (filters) => {
    const nextFilters = normalizeHistoryFilters(filters);
    set({
      currentHistoryFilters: nextFilters,
      historyError: null,
      isLoadingHistory: true,
    });

    try {
      const result = await getAttendanceHistory(nextFilters);

      set({
        currentHistoryFilters: nextFilters,
        history: result.records,
        historyMeta: result.meta,
        isLoadingHistory: false,
      });
    } catch (error) {
      set({
        historyError: getErrorMessage(error),
        isLoadingHistory: false,
      });
    }
  },
  loadMoreHistory: async (filters) => {
    const state = get();

    if (
      state.isLoadingHistory ||
      state.isLoadingMoreHistory ||
      !state.historyMeta ||
      state.historyMeta.currentPage >= state.historyMeta.lastPage
    ) {
      return;
    }

    const baseFilters = normalizeHistoryFilters(
      filters ??
        state.currentHistoryFilters ?? {
          projectId: state.historyMeta.selectedProjectId ?? 0,
        },
    );

    if (!baseFilters.projectId) {
      return;
    }

    const nextPage = state.historyMeta.currentPage + 1;
    set({
      currentHistoryFilters: baseFilters,
      historyError: null,
      isLoadingMoreHistory: true,
    });

    try {
      const result = await getAttendanceHistory({
        ...baseFilters,
        page: nextPage,
      });

      set((current) => ({
        currentHistoryFilters: baseFilters,
        history: [...current.history, ...result.records],
        historyMeta: result.meta,
        isLoadingMoreHistory: false,
      }));
    } catch (error) {
      set({
        historyError: getErrorMessage(error),
        isLoadingMoreHistory: false,
      });
    }
  },
  loadTodayAttendance: async (projectId) => {
    set({
      currentProjectId: projectId,
      isLoadingToday: true,
      todayError: null,
    });

    try {
      const todayAttendance = await getTodayAttendance(projectId);

      set((current) => ({
        currentProjectId: projectId,
        isLoadingToday: false,
        todayAttendance,
        todayProjectId:
          todayAttendance.status === 'not_checked_in'
            ? null
            : (current.todayProjectId ?? projectId),
      }));
    } catch (error) {
      set({
        isLoadingToday: false,
        todayError: getErrorMessage(error),
      });
    }
  },
  resetAttendanceState: () => {
    set(initialState);
  },
  submitCheckIn: async (projectId) => {
    const state = get();

    if (state.isSubmitting) {
      return null;
    }

    set({
      currentProjectId: projectId,
      isSubmitting: true,
      todayError: null,
    });

    try {
      const todayAttendance = await checkIn({ projectId });
      set({
        currentProjectId: projectId,
        isSubmitting: false,
        todayAttendance,
        todayProjectId: projectId,
      });
      await Promise.all([
        get().loadTodayAttendance(projectId),
        refreshHistorySlice(get(), set),
      ]);
      return todayAttendance;
    } catch (error) {
      set({
        isSubmitting: false,
        todayError: getErrorMessage(error),
      });
      return null;
    }
  },
  submitCheckOut: async () => {
    const state = get();

    if (state.isSubmitting) {
      return null;
    }

    set({
      isSubmitting: true,
      todayError: null,
    });

    try {
      const todayAttendance = await checkOut();
      const projectId =
        state.todayProjectId ??
        state.currentProjectId ??
        state.currentHistoryFilters?.projectId ??
        null;

      set({
        isSubmitting: false,
        todayAttendance,
      });

      await Promise.all([
        projectId ? get().loadTodayAttendance(projectId) : Promise.resolve(),
        refreshHistorySlice(get(), set),
      ]);

      return todayAttendance;
    } catch (error) {
      set({
        isSubmitting: false,
        todayError: getErrorMessage(error),
      });
      return null;
    }
  },
}));
