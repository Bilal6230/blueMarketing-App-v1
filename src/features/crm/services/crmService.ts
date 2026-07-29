import { createCrmSeedData } from '@/features/crm/data/crmSeed';
import type { CrmCallStatusId } from '@/features/crm/data/crmMetadata';
import {
  getFollowUpTiming,
  type FollowUpTiming,
  type LeadRecordState,
} from '@/features/crm/utils/crmSelectors';

export type AssignedUser = {
  id: number;
  name: string;
};

export type LeadProject = {
  id: number;
  name: string | null;
};

export type LeadListRecord = {
  assignedUser: AssignedUser | null;
  createdAt: string | null;
  firstName: string;
  followUp: string | null;
  id: number;
  lastName: string;
  mobileNumber: string | null;
  phoneNumber: string;
  project: LeadProject;
  recordState: LeadRecordState;
};

export type LeadDetailRecord = LeadListRecord & {
  latestRemarks: string | null;
  nicNumberMasked: string | null;
  updatedAt: string | null;
};

export type LeadHistoryRecord = {
  callDuration: number | null;
  callStatus: number | null;
  comment: string | null;
  createdAt: string | null;
  followUp: string | null;
  id: number;
  user: AssignedUser | null;
};

export type CrmSummary = {
  activeLeads: number;
  overdueFollowups: number;
  todayFollowups: number;
  totalLeads: number;
};

export type CrmQuickFilter = 'all' | 'overdue' | 'today' | 'upcoming';
export type CrmRecordStateFilter = 'active' | 'all' | 'inactive';
export type CrmSortBy = 'created_at' | 'first_name' | 'follow_up' | 'last_name';
export type CrmSortOrder = 'asc' | 'desc';

export type CrmFilters = {
  followUpFrom: string;
  followUpTo: string;
  quickFilter: CrmQuickFilter;
  recordState: CrmRecordStateFilter;
  search: string;
  sortBy: CrmSortBy;
  sortOrder: CrmSortOrder;
};

export type CrmPagination = {
  page: number;
  perPage: number;
};

export type CrmPaginationMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type CreateLeadInput = {
  firstName: string;
  followUp: string | null;
  lastName: string;
  mobileNumber: string | null;
  nicNumber: string | null;
  phoneNumber: string;
  projectId: number;
  remarks: string | null;
};

export type UpdateLeadInput = {
  firstName: string;
  followUp: string | null;
  lastName: string;
  mobileNumber: string | null;
  nicNumber: string | null;
  phoneNumber: string;
  remarks: string | null;
};

export type UpdateFollowUpInput = {
  followUpDate: string;
  remarks: string | null;
  status: CrmCallStatusId | null;
};

type InternalLeadRecord = ReturnType<typeof createCrmSeedData>[number];

const CRM_DELAY_MS = 120;
let leadsDb = createCrmSeedData();
let nextLeadId = 2000;
let nextHistoryId = 10000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskNicNumber(nicNumber: string | null) {
  if (!nicNumber) {
    return null;
  }

  const visible = nicNumber.slice(-4);
  const maskedLength = Math.max(nicNumber.length - 4, 5);

  return `${'*'.repeat(maskedLength)}${visible}`;
}

function toLeadListRecord(lead: InternalLeadRecord): LeadListRecord {
  return {
    assignedUser: lead.assignedUser ? { ...lead.assignedUser } : null,
    createdAt: lead.createdAt,
    firstName: lead.firstName,
    followUp: lead.followUp,
    id: lead.id,
    lastName: lead.lastName,
    mobileNumber: lead.mobileNumber,
    phoneNumber: lead.phoneNumber,
    project: { ...lead.project },
    recordState: lead.isActive ? 'active' : 'inactive',
  };
}

function toLeadDetailRecord(lead: InternalLeadRecord): LeadDetailRecord {
  return {
    ...toLeadListRecord(lead),
    latestRemarks: lead.latestRemarks,
    nicNumberMasked: maskNicNumber(lead.nicNumber),
    updatedAt: lead.updatedAt,
  };
}

function cloneHistory(history: InternalLeadRecord['history']) {
  return history.map((item) => ({
    ...item,
    user: item.user ? { ...item.user } : null,
  }));
}

function matchesSearch(lead: InternalLeadRecord, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    lead.firstName,
    lead.lastName,
    lead.phoneNumber,
    lead.mobileNumber ?? '',
    lead.nicNumber ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
}

function matchesQuickFilter(lead: InternalLeadRecord, quickFilter: CrmQuickFilter) {
  if (quickFilter === 'all') {
    return true;
  }

  return getFollowUpTiming(lead.followUp) === quickFilter;
}

function matchesDateRange(lead: InternalLeadRecord, filters: CrmFilters) {
  const followUp = lead.followUp ? new Date(lead.followUp.replace(' ', 'T')) : null;

  if (!followUp) {
    return !filters.followUpFrom && !filters.followUpTo;
  }

  if (filters.followUpFrom) {
    const fromDate = new Date(`${filters.followUpFrom}T00:00:00`);

    if (followUp < fromDate) {
      return false;
    }
  }

  if (filters.followUpTo) {
    const toDate = new Date(`${filters.followUpTo}T23:59:59`);

    if (followUp > toDate) {
      return false;
    }
  }

  return true;
}

function applyFilters(leads: InternalLeadRecord[], projectId: number, filters: CrmFilters) {
  return leads
    .filter((lead) => lead.project.id === projectId)
    .filter((lead) =>
      filters.recordState === 'all'
        ? true
        : filters.recordState === 'active'
          ? lead.isActive
          : !lead.isActive,
    )
    .filter((lead) => matchesQuickFilter(lead, filters.quickFilter))
    .filter((lead) => matchesDateRange(lead, filters))
    .filter((lead) => matchesSearch(lead, filters.search));
}

function compareValues(left: string | null, right: string | null, order: CrmSortOrder) {
  const leftValue = left ?? '';
  const rightValue = right ?? '';
  const result = leftValue.localeCompare(rightValue, 'en', { sensitivity: 'base' });

  return order === 'asc' ? result : result * -1;
}

function sortLeads(leads: InternalLeadRecord[], filters: CrmFilters) {
  const sortedLeads = [...leads].sort((left, right) => {
    if (filters.sortBy === 'created_at') {
      return compareValues(left.createdAt, right.createdAt, filters.sortOrder);
    }

    if (filters.sortBy === 'first_name') {
      return compareValues(left.firstName, right.firstName, filters.sortOrder);
    }

    if (filters.sortBy === 'last_name') {
      return compareValues(left.lastName, right.lastName, filters.sortOrder);
    }

    return compareValues(left.followUp, right.followUp, filters.sortOrder);
  });

  return sortedLeads;
}

function getLeadIndex(leadId: number) {
  return leadsDb.findIndex((lead) => lead.id === leadId);
}

function createHistoryRecord(
  input: {
    callDuration?: number | null;
    callStatus?: number | null;
    comment?: string | null;
    followUp?: string | null;
    user?: AssignedUser | null;
  } = {},
): LeadHistoryRecord {
  return {
    callDuration: input.callDuration ?? null,
    callStatus: input.callStatus ?? null,
    comment: input.comment ?? null,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    followUp: input.followUp ?? null,
    id: nextHistoryId++,
    user: input.user ?? null,
  };
}

export const defaultCrmFilters: CrmFilters = {
  followUpFrom: '',
  followUpTo: '',
  quickFilter: 'all',
  recordState: 'all',
  search: '',
  sortBy: 'follow_up',
  sortOrder: 'asc',
};

export async function getSummary(projectId: number): Promise<CrmSummary> {
  await delay(CRM_DELAY_MS);
  const projectLeads = leadsDb.filter((lead) => lead.project.id === projectId);

  return {
    activeLeads: projectLeads.filter((lead) => lead.isActive).length,
    overdueFollowups: projectLeads.filter(
      (lead) => getFollowUpTiming(lead.followUp) === 'overdue',
    ).length,
    todayFollowups: projectLeads.filter(
      (lead) => getFollowUpTiming(lead.followUp) === 'today',
    ).length,
    totalLeads: projectLeads.length,
  };
}

export async function getLeads(
  projectId: number,
  filters: CrmFilters = defaultCrmFilters,
  pagination: CrmPagination = { page: 1, perPage: 20 },
) {
  await delay(CRM_DELAY_MS);
  const filteredLeads = sortLeads(applyFilters(leadsDb, projectId, filters), filters);
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const data = filteredLeads
    .slice(startIndex, startIndex + pagination.perPage)
    .map(toLeadListRecord);

  return {
    data,
    meta: {
      currentPage: pagination.page,
      lastPage: Math.max(Math.ceil(filteredLeads.length / pagination.perPage), 1),
      perPage: pagination.perPage,
      total: filteredLeads.length,
    } satisfies CrmPaginationMeta,
  };
}

export async function getLead(id: number) {
  await delay(CRM_DELAY_MS);
  const lead = leadsDb.find((item) => item.id === id);

  return lead ? toLeadDetailRecord(lead) : null;
}

export async function getHistory(id: number) {
  await delay(CRM_DELAY_MS);
  const lead = leadsDb.find((item) => item.id === id);

  return lead ? cloneHistory(lead.history) : [];
}

export async function createLead(input: CreateLeadInput) {
  await delay(CRM_DELAY_MS);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const leadId = nextLeadId++;
  const initialHistory =
    input.remarks?.trim()
      ? [
          createHistoryRecord({
            callStatus: 6,
            comment: input.remarks.trim(),
            followUp: input.followUp,
            user: null,
          }),
        ]
      : [];

  leadsDb = [
    {
      assignedUser: null,
      createdAt: now,
      firstName: input.firstName.trim(),
      followStatus: 6,
      followUp: input.followUp,
      history: initialHistory,
      id: leadId,
      isActive: true,
      lastName: input.lastName.trim(),
      latestRemarks: input.remarks?.trim() || null,
      mobileNumber: input.mobileNumber?.trim() || null,
      nicNumber: input.nicNumber?.trim() || null,
      phoneNumber: input.phoneNumber.trim(),
      project: {
        id: input.projectId,
        name: input.projectId === 102 ? 'Blue Heights' : 'Blue Residency',
      },
      updatedAt: now,
    },
    ...leadsDb,
  ];

  return { id: leadId };
}

export async function updateLead(id: number, input: UpdateLeadInput) {
  await delay(CRM_DELAY_MS);
  const leadIndex = getLeadIndex(id);

  if (leadIndex < 0) {
    return null;
  }

  const currentLead = leadsDb[leadIndex]!;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const nextHistory =
    input.remarks?.trim()
      ? [
          createHistoryRecord({
            comment: input.remarks.trim(),
            followUp: input.followUp,
            user: currentLead.assignedUser,
          }),
          ...currentLead.history,
        ]
      : currentLead.history;

  leadsDb[leadIndex] = {
    ...currentLead,
    firstName: input.firstName.trim(),
    followUp: input.followUp,
    history: nextHistory,
    lastName: input.lastName.trim(),
    latestRemarks:
      input.remarks?.trim() || currentLead.latestRemarks,
    mobileNumber: input.mobileNumber?.trim() || null,
    nicNumber: input.nicNumber?.trim() || null,
    phoneNumber: input.phoneNumber.trim(),
    updatedAt: now,
  };

  return { id };
}

export async function updateFollowUp(id: number, input: UpdateFollowUpInput) {
  await delay(CRM_DELAY_MS);
  const leadIndex = getLeadIndex(id);

  if (leadIndex < 0) {
    return null;
  }

  const currentLead = leadsDb[leadIndex]!;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const nextHistoryRecord = createHistoryRecord({
    callStatus: input.status,
    comment: input.remarks?.trim() || null,
    followUp: input.followUpDate,
    user: currentLead.assignedUser,
  });

  leadsDb[leadIndex] = {
    ...currentLead,
    followStatus: input.status ?? currentLead.followStatus,
    followUp: input.followUpDate,
    history: [nextHistoryRecord, ...currentLead.history],
    latestRemarks: input.remarks?.trim() || currentLead.latestRemarks,
    updatedAt: now,
  };

  return {
    followUp: input.followUpDate,
    id,
  };
}

export function __resetCrmServiceData() {
  leadsDb = createCrmSeedData();
  nextLeadId = 2000;
  nextHistoryId = 10000;
}
