import { create } from 'zustand';

import {
  addFollowUp,
  createInitialLeads,
  getLead,
  getLeads,
  type AddFollowUpInput,
  type LeadFilters,
  type LeadRecord,
  type UpdateLeadInput,
  updateLead,
} from '@/features/crm/services/crmService';

type CrmState = {
  leads: LeadRecord[];
  selectedLeadId: string | null;
  addLeadFollowUp: (leadId: string, input: AddFollowUpInput) => boolean;
  getLeadById: (leadId: string) => LeadRecord | null;
  getVisibleLeads: (filters: LeadFilters) => LeadRecord[];
  selectLead: (leadId: string | null) => void;
  updateLeadRecord: (leadId: string, input: UpdateLeadInput) => boolean;
};

export const useCrmStore = create<CrmState>((set, get) => ({
  leads: createInitialLeads(),
  selectedLeadId: null,
  addLeadFollowUp: (leadId, input) => {
    const currentLead = get().leads.find((lead) => lead.id === leadId);

    if (!currentLead) {
      return false;
    }

    const updatedLead = addFollowUp(currentLead, input);

    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === leadId ? updatedLead : lead)),
    }));

    return true;
  },
  getLeadById: (leadId) => getLead(leadId, get().leads),
  getVisibleLeads: (filters) => getLeads(filters, get().leads),
  selectLead: (leadId) => set({ selectedLeadId: leadId }),
  updateLeadRecord: (leadId, input) => {
    const currentLead = get().leads.find((lead) => lead.id === leadId);

    if (!currentLead) {
      return false;
    }

    const updatedLead = updateLead(currentLead, input);

    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === leadId ? updatedLead : lead)),
    }));

    return true;
  },
}));
