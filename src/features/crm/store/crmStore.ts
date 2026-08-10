import { create } from 'zustand';

import { ApiError } from '@/api/errors';
import {
  createLead,
  defaultCrmFilters,
  getHistory,
  getLead,
  getLeads,
  getSummary,
  type CreateLeadInput,
  type CrmFilters,
  type CrmPagination,
  type CrmPaginationMeta,
  type CrmSummary,
  type LeadDetailRecord,
  type LeadHistoryRecord,
  type LeadListRecord,
  type UpdateFollowUpInput,
  type UpdateLeadInput,
  updateFollowUp,
  updateLead,
} from '@/features/crm/services/crmService';

type CrmState = {
  currentFilters: CrmFilters;
  currentPagination: CrmPagination;
  currentProjectId: number | null;
  detailById: Record<number, LeadDetailRecord>;
  historyByLeadId: Record<number, LeadHistoryRecord[]>;
  historyErrorByLeadId: Record<number, ApiError | null>;
  isLoadingLead: boolean;
  isLoadingLeads: boolean;
  isLoadingMoreLeads: boolean;
  isMutating: boolean;
  leadError: ApiError | null;
  leads: LeadListRecord[];
  leadsError: ApiError | null;
  meta: CrmPaginationMeta | null;
  mutationError: ApiError | null;
  summary: CrmSummary | null;
  createLeadRecord: (input: CreateLeadInput) => Promise<LeadDetailRecord>;
  loadLeadDetail: (leadId: number) => Promise<LeadDetailRecord | null>;
  loadLeadHistory: (leadId: number) => Promise<LeadHistoryRecord[]>;
  loadLeads: (
    projectId: number,
    filters?: Partial<CrmFilters>,
    pagination?: Partial<CrmPagination>,
  ) => Promise<void>;
  loadNextLeadsPage: () => Promise<void>;
  loadSummary: (projectId: number) => Promise<CrmSummary>;
  resetCrmState: () => void;
  updateLeadFollowUp: (
    leadId: number,
    input: UpdateFollowUpInput,
  ) => Promise<LeadDetailRecord>;
  updateLeadRecord: (
    leadId: number,
    input: UpdateLeadInput,
  ) => Promise<LeadDetailRecord>;
};

const initialState = {
  currentFilters: defaultCrmFilters,
  currentPagination: { page: 1, perPage: 20 },
  currentProjectId: null,
  detailById: {},
  historyByLeadId: {},
  historyErrorByLeadId: {},
  isLoadingLead: false,
  isLoadingLeads: false,
  isLoadingMoreLeads: false,
  isMutating: false,
  leadError: null,
  leads: [],
  leadsError: null,
  meta: null,
  mutationError: null,
  summary: null,
};

function dedupeLeadsById(leads: LeadListRecord[]) {
  const seenLeadIds = new Set<number>();

  return leads.filter((lead) => {
    if (seenLeadIds.has(lead.id)) {
      return false;
    }

    seenLeadIds.add(lead.id);
    return true;
  });
}

function getApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError({
    errorKey: 'unexpected_response',
    message: 'Unable to load CRM right now. Try again.',
    statusCode: null,
  });
}

function shouldResetVisibleLeads(
  state: CrmState,
  projectId: number,
  nextFilters: CrmFilters,
  nextPagination: CrmPagination,
) {
  return (
    state.currentProjectId !== projectId ||
    nextPagination.page === 1 ||
    JSON.stringify(state.currentFilters) !== JSON.stringify(nextFilters)
  );
}

export const useCrmStore = create<CrmState>((set, get) => {
  let leadsRequestSequence = 0;
  let leadRequestSequence = 0;

  async function refreshCurrentProjectData() {
    const state = get();

    if (!state.currentProjectId) {
      return;
    }

    await get().loadLeads(
      state.currentProjectId,
      state.currentFilters,
      state.currentPagination,
    );
  }

  return {
    ...initialState,
    createLeadRecord: async (input) => {
      set({
        isMutating: true,
        mutationError: null,
      });

      try {
        const createdLead = await createLead(input);
        const detail = await getLead(createdLead.id);

        set((state) => ({
          detailById: {
            ...state.detailById,
            [detail.id]: detail,
          },
        }));

        if (get().currentProjectId === input.projectId) {
          await refreshCurrentProjectData();
        } else {
          const summary = await getSummary(input.projectId);
          set({ summary });
        }

        return detail;
      } catch (error) {
        const apiError = getApiError(error);
        set({ mutationError: apiError });
        throw apiError;
      } finally {
        set({ isMutating: false });
      }
    },
    loadLeadDetail: async (leadId) => {
      const requestSequence = ++leadRequestSequence;

      set((state) => {
        const nextDetailById = { ...state.detailById };
        delete nextDetailById[leadId];

        return {
          detailById: nextDetailById,
          isLoadingLead: true,
          leadError: null,
        };
      });

      try {
        const detail = await getLead(leadId);

        if (requestSequence !== leadRequestSequence) {
          return detail;
        }

        set((state) => ({
          detailById: {
            ...state.detailById,
            [leadId]: detail,
          },
          leadError: null,
        }));

        return detail;
      } catch (error) {
        const apiError = getApiError(error);

        if (requestSequence === leadRequestSequence) {
          set({ leadError: apiError });
        }

        return null;
      } finally {
        if (requestSequence === leadRequestSequence) {
          set({ isLoadingLead: false });
        }
      }
    },
    loadLeadHistory: async (leadId) => {
      set((state) => ({
        historyErrorByLeadId: {
          ...state.historyErrorByLeadId,
          [leadId]: null,
        },
      }));

      try {
        const history = await getHistory(leadId);

        set((state) => ({
          historyByLeadId: {
            ...state.historyByLeadId,
            [leadId]: history,
          },
          historyErrorByLeadId: {
            ...state.historyErrorByLeadId,
            [leadId]: null,
          },
        }));

        return history;
      } catch (error) {
        const apiError = getApiError(error);

        set((state) => ({
          historyByLeadId: {
            ...state.historyByLeadId,
            [leadId]: [],
          },
          historyErrorByLeadId: {
            ...state.historyErrorByLeadId,
            [leadId]: apiError,
          },
        }));

        return [];
      }
    },
    loadLeads: async (projectId, filters, pagination) => {
      const state = get();
      const nextFilters = { ...state.currentFilters, ...filters };
      const nextPagination = { ...state.currentPagination, ...pagination };
      const requestSequence = ++leadsRequestSequence;
      const appendResults =
        nextPagination.page > 1 &&
        state.currentProjectId === projectId &&
        JSON.stringify(state.currentFilters) === JSON.stringify(nextFilters);

      set((currentState) => ({
        currentFilters: nextFilters,
        currentPagination: nextPagination,
        currentProjectId: projectId,
        isLoadingLeads: !appendResults,
        isLoadingMoreLeads: appendResults,
        leads: shouldResetVisibleLeads(
          currentState,
          projectId,
          nextFilters,
          nextPagination,
        )
          ? []
          : currentState.leads,
        leadsError: null,
      }));

      try {
        const [summary, leadResponse] = await Promise.all([
          getSummary(projectId),
          getLeads(projectId, nextFilters, nextPagination),
        ]);

        if (requestSequence !== leadsRequestSequence) {
          return;
        }

        set((currentState) => ({
          isLoadingLead: currentState.isLoadingLead,
          leads: appendResults
            ? dedupeLeadsById([...currentState.leads, ...leadResponse.data])
            : leadResponse.data,
          leadsError: null,
          meta: leadResponse.meta,
          summary,
        }));
      } catch (error) {
        const apiError = getApiError(error);

        if (requestSequence === leadsRequestSequence) {
          set({
            leadsError: apiError,
          });
        }
      } finally {
        if (requestSequence === leadsRequestSequence) {
          set({
            isLoadingLeads: false,
            isLoadingMoreLeads: false,
          });
        }
      }
    },
    loadNextLeadsPage: async () => {
      const state = get();

      if (
        state.isLoadingLeads ||
        state.isLoadingMoreLeads ||
        !state.currentProjectId ||
        !state.meta ||
        state.currentPagination.page >= state.meta.lastPage
      ) {
        return;
      }

      await get().loadLeads(state.currentProjectId, state.currentFilters, {
        page: state.currentPagination.page + 1,
        perPage: state.currentPagination.perPage,
      });
    },
    loadSummary: async (projectId) => {
      const summary = await getSummary(projectId);
      set({ currentProjectId: projectId, summary });
      return summary;
    },
    resetCrmState: () => {
      set(initialState);
      leadsRequestSequence += 1;
      leadRequestSequence += 1;
    },
    updateLeadFollowUp: async (leadId, input) => {
      set({
        isMutating: true,
        mutationError: null,
      });

      try {
        await updateFollowUp(leadId, input);
        const [detail, history] = await Promise.all([
          getLead(leadId),
          getHistory(leadId),
        ]);

        set((state) => ({
          detailById: {
            ...state.detailById,
            [leadId]: detail,
          },
          historyByLeadId: {
            ...state.historyByLeadId,
            [leadId]: history,
          },
          historyErrorByLeadId: {
            ...state.historyErrorByLeadId,
            [leadId]: null,
          },
        }));

        await refreshCurrentProjectData();

        return detail;
      } catch (error) {
        const apiError = getApiError(error);
        set({ mutationError: apiError });
        throw apiError;
      } finally {
        set({ isMutating: false });
      }
    },
    updateLeadRecord: async (leadId, input) => {
      set({
        isMutating: true,
        mutationError: null,
      });

      try {
        await updateLead(leadId, input);
        const [detail, history] = await Promise.all([
          getLead(leadId),
          getHistory(leadId),
        ]);

        set((state) => ({
          detailById: {
            ...state.detailById,
            [leadId]: detail,
          },
          historyByLeadId: {
            ...state.historyByLeadId,
            [leadId]: history,
          },
          historyErrorByLeadId: {
            ...state.historyErrorByLeadId,
            [leadId]: null,
          },
        }));

        await refreshCurrentProjectData();

        return detail;
      } catch (error) {
        const apiError = getApiError(error);
        set({ mutationError: apiError });
        throw apiError;
      } finally {
        set({ isMutating: false });
      }
    },
  };
});
