import { create } from 'zustand';

import {
  getLabourSites,
  getLabourTodayDate,
  getLabours,
  markLabourAttendance,
  type LabourAttendanceDraft,
  type LabourListFilters,
  type LabourListMeta,
  type LabourRecord,
  type LabourRecordState,
  type LabourSite,
} from '@/features/attendance/labour/services/labourAttendanceService';

type LabourAttendanceState = {
  currentFilters: LabourListFilters | null;
  currentProjectId: number | null;
  drafts: Record<number, LabourAttendanceDraft>;
  isLoadingLabours: boolean;
  isLoadingMore: boolean;
  isLoadingSites: boolean;
  isSaving: boolean;
  labours: LabourRecord[];
  loadError: string | null;
  loadLabours: (filters: LabourListFilters) => Promise<void>;
  loadMoreLabours: () => Promise<void>;
  loadSites: (projectId: number) => Promise<void>;
  markAbsent: (labourId: number) => void;
  markAllVisiblePresent: () => void;
  markPresent: (labourId: number) => void;
  meta: LabourListMeta | null;
  recordStateFilter: LabourRecordState;
  resetLabourAttendanceState: () => void;
  saveAttendance: (
    projectId: number,
    siteId: number | null,
  ) => Promise<{
    created: number;
    updated: number;
  } | null>;
  saveError: string | null;
  search: string;
  selectedSiteId: number | null;
  selectSite: (siteId: number | null) => void;
  setRecordStateFilter: (value: LabourRecordState) => void;
  setSearch: (value: string) => void;
  sites: LabourSite[];
  successMessage: string | null;
  updateDraft: (
    labourId: number,
    changes: Partial<Omit<LabourAttendanceDraft, 'labourId'>>,
  ) => void;
  clearDraft: (labourId: number) => void;
};

const initialState = {
  currentFilters: null,
  currentProjectId: null,
  drafts: {},
  isLoadingLabours: false,
  isLoadingMore: false,
  isLoadingSites: false,
  isSaving: false,
  labours: [],
  loadError: null,
  meta: null,
  recordStateFilter: 'active' as LabourRecordState,
  saveError: null,
  search: '',
  selectedSiteId: null,
  sites: [],
  successMessage: null,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Labour attendance could not be loaded.';
}

function getLabourById(labours: LabourRecord[], labourId: number) {
  return labours.find((labour) => labour.id === labourId) ?? null;
}

function createPresentDraft(labour: LabourRecord, existing?: LabourAttendanceDraft) {
  return {
    hours: existing?.hours ?? 8,
    isDirty: true,
    labourId: labour.id,
    overtimeHours: existing?.overtimeHours ?? 0,
    rate: existing?.rate ?? Number(labour.dailyWage),
    rating: existing?.rating ?? null,
    remarks: existing?.remarks ?? '',
    status: 'present' as const,
  };
}

export const useLabourAttendanceStore = create<LabourAttendanceState>(
  (set, get) => ({
    ...initialState,
    clearDraft: (labourId) => {
      set((state) => {
        const nextDrafts = { ...state.drafts };
        delete nextDrafts[labourId];
        return { drafts: nextDrafts };
      });
    },
    loadLabours: async (filters) => {
      set({
        currentFilters: {
          ...filters,
          page: filters.page ?? 1,
          perPage: filters.perPage ?? 12,
        },
        currentProjectId: filters.projectId,
        isLoadingLabours: true,
        loadError: null,
      });

      try {
        const result = await getLabours({
          ...filters,
          page: filters.page ?? 1,
          perPage: filters.perPage ?? 12,
        });

        set({
          currentFilters: {
            ...filters,
            page: filters.page ?? 1,
            perPage: filters.perPage ?? 12,
          },
          currentProjectId: filters.projectId,
          isLoadingLabours: false,
          labours: result.records,
          meta: result.meta,
        });
      } catch (error) {
        set({
          isLoadingLabours: false,
          loadError: getErrorMessage(error),
        });
      }
    },
    loadMoreLabours: async () => {
      const state = get();

      if (
        state.isLoadingLabours ||
        state.isLoadingMore ||
        !state.currentFilters ||
        !state.meta ||
        state.meta.currentPage >= state.meta.lastPage
      ) {
        return;
      }

      const nextPage = state.meta.currentPage + 1;
      set({ isLoadingMore: true, loadError: null });

      try {
        const result = await getLabours({
          ...state.currentFilters,
          page: nextPage,
        });

        set((current) => ({
          isLoadingMore: false,
          labours: [...current.labours, ...result.records],
          meta: result.meta,
        }));
      } catch (error) {
        set({
          isLoadingMore: false,
          loadError: getErrorMessage(error),
        });
      }
    },
    loadSites: async (projectId) => {
      set({
        currentProjectId: projectId,
        isLoadingSites: true,
        loadError: null,
        selectedSiteId: null,
      });

      try {
        const sites = await getLabourSites(projectId);

        set({
          currentProjectId: projectId,
          isLoadingSites: false,
          sites,
        });
      } catch (error) {
        set({
          isLoadingSites: false,
          loadError: getErrorMessage(error),
        });
      }
    },
    markAbsent: (labourId) => {
      const labour = getLabourById(get().labours, labourId);

      if (!labour) {
        return;
      }

      set((state) => ({
        drafts: {
          ...state.drafts,
          [labourId]: {
            hours: 0,
            isDirty: true,
            labourId,
            overtimeHours: 0,
            rate: Number(labour.dailyWage),
            rating: null,
            remarks: state.drafts[labourId]?.remarks ?? '',
            status: 'absent',
          },
        },
      }));
    },
    markAllVisiblePresent: () => {
      set((state) => {
        if (state.recordStateFilter !== 'active') {
          return state;
        }

        const nextDrafts = { ...state.drafts };

        for (const labour of state.labours) {
          if (state.drafts[labour.id] || labour.todayAttendance) {
            continue;
          }

          nextDrafts[labour.id] = createPresentDraft(labour);
        }

        return { drafts: nextDrafts };
      });
    },
    markPresent: (labourId) => {
      const labour = getLabourById(get().labours, labourId);

      if (!labour) {
        return;
      }

      set((state) => ({
        drafts: {
          ...state.drafts,
          [labourId]: createPresentDraft(labour, state.drafts[labourId]),
        },
      }));
    },
    resetLabourAttendanceState: () => {
      set(initialState);
    },
    saveAttendance: async (projectId, siteId) => {
      const state = get();

      if (state.isSaving) {
        return null;
      }

      const dirtyDrafts = Object.values(state.drafts).filter(
        (draft) => draft.isDirty && draft.status !== null,
      );

      if (!siteId || dirtyDrafts.length === 0) {
        return null;
      }

      set({
        isSaving: true,
        saveError: null,
        successMessage: null,
      });

      try {
        const result = await markLabourAttendance({
          date: getLabourTodayDate(),
          projectId,
          records: dirtyDrafts.map((draft) => ({
            hours: draft.status === 'present' ? draft.hours : 0,
            labourId: draft.labourId,
            overtimeHours:
              draft.status === 'present' ? draft.overtimeHours : 0,
            rate: draft.status === 'present' ? draft.rate : 0,
            rating:
              draft.status === 'present' ? (draft.rating ?? undefined) : undefined,
            remarks: draft.remarks.trim() || undefined,
            status: draft.status!,
          })),
          siteId,
        });

        const nextDrafts = { ...get().drafts };

        for (const draft of dirtyDrafts) {
          delete nextDrafts[draft.labourId];
        }

        set({
          drafts: nextDrafts,
          isSaving: false,
          saveError: null,
          successMessage: `Attendance saved. ${result.created} created, ${result.updated} updated.`,
        });

        if (get().currentFilters) {
          await get().loadLabours({
            ...get().currentFilters!,
            projectId,
            siteId,
          });
        }

        return {
          created: result.created,
          updated: result.updated,
        };
      } catch (error) {
        set({
          isSaving: false,
          saveError: getErrorMessage(error),
        });
        return null;
      }
    },
    search: '',
    selectSite: (siteId) => {
      set({ selectedSiteId: siteId });
    },
    setRecordStateFilter: (value) => {
      set({ recordStateFilter: value });
    },
    setSearch: (value) => {
      set({ search: value });
    },
    sites: [],
    successMessage: null,
    updateDraft: (labourId, changes) => {
      set((state) => {
        const labour = getLabourById(state.labours, labourId);
        const currentDraft =
          state.drafts[labourId] ??
          (labour
            ? {
                hours:
                  labour.todayAttendance?.status === 'present'
                    ? Number(labour.todayAttendance.hours)
                    : 0,
                isDirty: true,
                labourId,
                overtimeHours:
                  labour.todayAttendance?.status === 'present'
                    ? Number(labour.todayAttendance.overtimeHours)
                    : 0,
                rate: Number(labour.dailyWage),
                rating: null,
                remarks: '',
                status: labour.todayAttendance?.status ?? null,
              }
            : null);

        if (!currentDraft) {
          return state;
        }

        return {
          drafts: {
            ...state.drafts,
            [labourId]: {
              ...currentDraft,
              ...changes,
              isDirty: true,
            },
          },
        };
      });
    },
  }),
);
