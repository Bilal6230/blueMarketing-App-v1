import { create } from 'zustand';

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
  isLoadingLead: boolean;
  isLoadingLeads: boolean;
  isMutating: boolean;
  leads: LeadListRecord[];
  meta: CrmPaginationMeta | null;
  summary: CrmSummary | null;
  createLeadRecord: (input: CreateLeadInput) => Promise<LeadDetailRecord | null>;
  loadLeadDetail: (leadId: number) => Promise<LeadDetailRecord | null>;
  loadLeadHistory: (leadId: number) => Promise<LeadHistoryRecord[]>;
  loadLeads: (
    projectId: number,
    filters?: Partial<CrmFilters>,
    pagination?: Partial<CrmPagination>,
  ) => Promise<void>;
  loadSummary: (projectId: number) => Promise<CrmSummary>;
  updateLeadFollowUp: (
    leadId: number,
    input: UpdateFollowUpInput,
  ) => Promise<LeadDetailRecord | null>;
  updateLeadRecord: (
    leadId: number,
    input: UpdateLeadInput,
  ) => Promise<LeadDetailRecord | null>;
};

async function refreshProjectData(
  projectId: number | null,
  filters: CrmFilters,
  pagination: CrmPagination,
  applyState: (partial: Partial<CrmState>) => void,
) {
  if (projectId === null) {
    return;
  }

  const [summary, leadResponse] = await Promise.all([
    getSummary(projectId),
    getLeads(projectId, filters, pagination),
  ]);

  applyState({
    leads: leadResponse.data,
    meta: leadResponse.meta,
    summary,
  });
}

export const useCrmStore = create<CrmState>((set, get) => ({
  currentFilters: defaultCrmFilters,
  currentPagination: { page: 1, perPage: 20 },
  currentProjectId: null,
  detailById: {},
  historyByLeadId: {},
  isLoadingLead: false,
  isLoadingLeads: false,
  isMutating: false,
  leads: [],
  meta: null,
  summary: null,
  createLeadRecord: async (input) => {
    set({ isMutating: true });
    const result = await createLead(input);
    const detail = await getLead(result.id);
    const currentState = get();

    await refreshProjectData(
      input.projectId,
      currentState.currentFilters,
      currentState.currentPagination,
      (partial) => set(partial),
    );

    if (detail) {
      set((state) => ({
        detailById: {
          ...state.detailById,
          [detail.id]: detail,
        },
      }));
    }

    set({ isMutating: false });

    return detail;
  },
  loadLeadDetail: async (leadId) => {
    set({ isLoadingLead: true });
    const detail = await getLead(leadId);

    set((state) => ({
      detailById: detail
        ? {
            ...state.detailById,
            [leadId]: detail,
          }
        : state.detailById,
      isLoadingLead: false,
    }));

    return detail;
  },
  loadLeadHistory: async (leadId) => {
    const history = await getHistory(leadId);

    set((state) => ({
      historyByLeadId: {
        ...state.historyByLeadId,
        [leadId]: history,
      },
    }));

    return history;
  },
  loadLeads: async (projectId, filters, pagination) => {
    const nextFilters = { ...get().currentFilters, ...filters };
    const nextPagination = { ...get().currentPagination, ...pagination };

    set({
      currentFilters: nextFilters,
      currentPagination: nextPagination,
      currentProjectId: projectId,
      isLoadingLeads: true,
    });

    const [summary, leadResponse] = await Promise.all([
      getSummary(projectId),
      getLeads(projectId, nextFilters, nextPagination),
    ]);

    set({
      isLoadingLeads: false,
      leads: leadResponse.data,
      meta: leadResponse.meta,
      summary,
    });
  },
  loadSummary: async (projectId) => {
    const summary = await getSummary(projectId);
    set({ currentProjectId: projectId, summary });
    return summary;
  },
  updateLeadFollowUp: async (leadId, input) => {
    set({ isMutating: true });
    const result = await updateFollowUp(leadId, input);

    if (!result) {
      set({ isMutating: false });
      return null;
    }

    const currentState = get();
    const detail = await getLead(leadId);
    const history = await getHistory(leadId);

    await refreshProjectData(
      currentState.currentProjectId,
      currentState.currentFilters,
      currentState.currentPagination,
      (partial) => set(partial),
    );

    set((state) => ({
      detailById: detail
        ? {
            ...state.detailById,
            [leadId]: detail,
          }
        : state.detailById,
      historyByLeadId: {
        ...state.historyByLeadId,
        [leadId]: history,
      },
      isMutating: false,
    }));

    return detail;
  },
  updateLeadRecord: async (leadId, input) => {
    set({ isMutating: true });
    const result = await updateLead(leadId, input);

    if (!result) {
      set({ isMutating: false });
      return null;
    }

    const currentState = get();
    const detail = await getLead(leadId);
    const history = await getHistory(leadId);

    await refreshProjectData(
      currentState.currentProjectId,
      currentState.currentFilters,
      currentState.currentPagination,
      (partial) => set(partial),
    );

    set((state) => ({
      detailById: detail
        ? {
            ...state.detailById,
            [leadId]: detail,
          }
        : state.detailById,
      historyByLeadId: {
        ...state.historyByLeadId,
        [leadId]: history,
      },
      isMutating: false,
    }));

    return detail;
  },
}));
