import { apiClient } from '@/api/client';
import type { ApiFieldErrors, ApiSuccessResponse } from '@/api/contracts';
import type { CrmCallStatusId } from '@/features/crm/data/crmMetadata';
import type {
  FollowUpTiming,
  LeadRecordState,
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
  nicNumber?: string | null;
  phoneNumber: string;
  remarks?: string | null;
};

export type UpdateFollowUpInput = {
  followUpDate: string;
  remarks: string | null;
  status: CrmCallStatusId | null;
};

type BackendAssignedUserDto = {
  id: number;
  name: string;
};

type BackendLeadProjectDto = {
  id: number;
  name: string | null;
};

type BackendLeadListDto = {
  assigned_user: BackendAssignedUserDto | null;
  created_at: string | null;
  first_name: string;
  follow_up: string | null;
  id: number;
  last_name: string;
  mobile_number: string | null;
  phone_number: string;
  project: BackendLeadProjectDto;
  status: 'active' | 'inactive';
};

type BackendLeadDetailDto = BackendLeadListDto & {
  nic_number_masked: string | null;
  remarks: string | null;
  updated_at: string | null;
};

type BackendLeadHistoryDto = {
  call_duration: number | null;
  call_status: number | null;
  comment: string | null;
  created_at: string | null;
  follow_up: string | null;
  id: number;
  user: BackendAssignedUserDto | null;
};

type BackendCrmSummaryDto = {
  active_leads: number;
  completed_or_future_followups: number;
  overdue_followups: number;
  today_followups: number;
  total_leads: number;
};

type BackendCrmPaginationMetaDto = {
  current_page: number;
  last_page: number;
  per_page: number;
  selected_project_id: number | null;
  total: number;
};

type BackendCreateLeadResponseDto = {
  id?: number;
  lead_id?: number;
};

type BackendUpdateFollowUpRequestDto = {
  follow_up_date: string;
  remarks?: string | null;
  status?: number | null;
};

type BackendCreateLeadRequestDto = {
  first_name: string;
  follow_up: string | null;
  last_name: string;
  mobile_number: string | null;
  nic_number: string | null;
  phone_number: string;
  project_id: number;
  remarks: string | null;
};

type BackendUpdateLeadRequestDto = {
  first_name: string;
  follow_up: string | null;
  last_name: string;
  mobile_number: string | null;
  nic_number?: string;
  phone_number: string;
  remarks?: string;
};

type CrmListParams = {
  assigned_user_id?: number;
  follow_up_from?: string;
  follow_up_to?: string;
  page: number;
  per_page: number;
  project_id: number;
  search?: string;
  sort_by: CrmSortBy;
  sort_order: CrmSortOrder;
  status?: 'active' | 'inactive';
};

type DateRange = {
  from?: string;
  to?: string;
};

type BuiltLeadListParams =
  | {
      params: CrmListParams;
      skipRequest: false;
    }
  | {
      params: CrmListParams;
      skipRequest: true;
    };

const FIELD_ERROR_MAP = {
  first_name: 'firstName',
  follow_up: 'followUp',
  follow_up_date: 'followUp',
  last_name: 'lastName',
  mobile_number: 'mobileNumber',
  nic_number: 'nicNumber',
  phone_number: 'phoneNumber',
  remarks: 'remarks',
} as const;

export type CrmFormField =
  | 'firstName'
  | 'followUp'
  | 'lastName'
  | 'mobileNumber'
  | 'nicNumber'
  | 'phoneNumber'
  | 'remarks';

export type CrmFormErrors = Partial<Record<CrmFormField, string>>;

export const defaultCrmFilters: CrmFilters = {
  followUpFrom: '',
  followUpTo: '',
  quickFilter: 'all',
  recordState: 'all',
  search: '',
  sortBy: 'follow_up',
  sortOrder: 'asc',
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function shiftDate(base: Date, days: number) {
  const nextDate = new Date(base);
  nextDate.setDate(nextDate.getDate() + days);
  return formatLocalDate(nextDate);
}

function getTodayDate(now: Date = new Date()) {
  return formatLocalDate(now);
}

function getQuickFilterRange(
  quickFilter: CrmQuickFilter,
  now: Date = new Date(),
): DateRange {
  if (quickFilter === 'today') {
    const today = getTodayDate(now);
    return { from: today, to: today };
  }

  if (quickFilter === 'overdue') {
    return { to: shiftDate(now, -1) };
  }

  if (quickFilter === 'upcoming') {
    return { from: shiftDate(now, 1) };
  }

  return {};
}

function normalizeDateRange(filters: CrmFilters, now: Date = new Date()) {
  const quickRange = getQuickFilterRange(filters.quickFilter, now);
  const advancedRange: DateRange = {
    from: filters.followUpFrom || undefined,
    to: filters.followUpTo || undefined,
  };

  const from = [quickRange.from, advancedRange.from]
    .filter(Boolean)
    .sort()
    .at(-1);
  const to = [quickRange.to, advancedRange.to].filter(Boolean).sort().at(0);

  if (from && to && from > to) {
    return null;
  }

  return { from, to };
}

function trimToUndefined(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function trimToNullable(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function mapAssignedUser(
  assignedUser: BackendAssignedUserDto | null,
): AssignedUser | null {
  if (!assignedUser) {
    return null;
  }

  return {
    id: assignedUser.id,
    name: assignedUser.name,
  };
}

function mapLeadProject(project: BackendLeadProjectDto): LeadProject {
  return {
    id: project.id,
    name: project.name,
  };
}

function mapLeadListRecord(lead: BackendLeadListDto): LeadListRecord {
  return {
    assignedUser: mapAssignedUser(lead.assigned_user),
    createdAt: lead.created_at,
    firstName: lead.first_name,
    followUp: lead.follow_up,
    id: lead.id,
    lastName: lead.last_name,
    mobileNumber: lead.mobile_number,
    phoneNumber: lead.phone_number,
    project: mapLeadProject(lead.project),
    recordState: lead.status,
  };
}

function mapLeadDetailRecord(lead: BackendLeadDetailDto): LeadDetailRecord {
  return {
    ...mapLeadListRecord(lead),
    latestRemarks: lead.remarks,
    nicNumberMasked: lead.nic_number_masked,
    updatedAt: lead.updated_at,
  };
}

function mapLeadHistoryRecord(leadHistory: BackendLeadHistoryDto): LeadHistoryRecord {
  return {
    callDuration: leadHistory.call_duration,
    callStatus: leadHistory.call_status,
    comment: leadHistory.comment,
    createdAt: leadHistory.created_at,
    followUp: leadHistory.follow_up,
    id: leadHistory.id,
    user: mapAssignedUser(leadHistory.user),
  };
}

function mapSummary(summary: BackendCrmSummaryDto): CrmSummary {
  return {
    activeLeads: summary.active_leads,
    overdueFollowups: summary.overdue_followups,
    todayFollowups: summary.today_followups,
    totalLeads: summary.total_leads,
  };
}

function mapPaginationMeta(meta: BackendCrmPaginationMetaDto): CrmPaginationMeta {
  return {
    currentPage: meta.current_page,
    lastPage: meta.last_page,
    perPage: meta.per_page,
    total: meta.total,
  };
}

function buildLeadListParams(
  projectId: number,
  filters: CrmFilters,
  pagination: CrmPagination,
  now: Date = new Date(),
): BuiltLeadListParams {
  const dateRange = normalizeDateRange(filters, now);
  const params: CrmListParams = {
    page: pagination.page,
    per_page: pagination.perPage,
    project_id: projectId,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder,
  };

  const search = trimToUndefined(filters.search);

  if (search) {
    params.search = search;
  }

  if (filters.recordState === 'active' || filters.recordState === 'inactive') {
    params.status = filters.recordState;
  }

  if (dateRange === null) {
    return { params, skipRequest: true };
  }

  if (dateRange.from) {
    params.follow_up_from = dateRange.from;
  }

  if (dateRange.to) {
    params.follow_up_to = dateRange.to;
  }

  return { params, skipRequest: false };
}

function toCreateLeadRequest(input: CreateLeadInput): BackendCreateLeadRequestDto {
  return {
    first_name: input.firstName.trim(),
    follow_up: trimToNullable(input.followUp),
    last_name: input.lastName.trim(),
    mobile_number: trimToNullable(input.mobileNumber),
    nic_number: trimToNullable(input.nicNumber),
    phone_number: input.phoneNumber.trim(),
    project_id: input.projectId,
    remarks: trimToNullable(input.remarks),
  };
}

function toUpdateLeadRequest(input: UpdateLeadInput): BackendUpdateLeadRequestDto {
  const nicNumber = trimToNullable(input.nicNumber);
  const remarks = trimToNullable(input.remarks);
  const request: BackendUpdateLeadRequestDto = {
    first_name: input.firstName.trim(),
    follow_up: trimToNullable(input.followUp),
    last_name: input.lastName.trim(),
    mobile_number: trimToNullable(input.mobileNumber),
    phone_number: input.phoneNumber.trim(),
  };

  if (nicNumber) {
    request.nic_number = nicNumber;
  }

  if (remarks) {
    request.remarks = remarks;
  }

  return request;
}

function toUpdateFollowUpRequest(
  input: UpdateFollowUpInput,
): BackendUpdateFollowUpRequestDto {
  return {
    follow_up_date: input.followUpDate,
    remarks: trimToNullable(input.remarks),
    status: input.status,
  };
}

function resolveCreatedLeadId(data: BackendCreateLeadResponseDto) {
  const leadId = data.id ?? data.lead_id ?? null;

  if (leadId === null) {
    throw new Error('CRM create lead response did not include a lead id.');
  }

  return leadId;
}

export function mapCrmFieldErrors(fieldErrors: ApiFieldErrors): CrmFormErrors {
  return Object.entries(fieldErrors).reduce<CrmFormErrors>((errors, [key, value]) => {
    const mappedKey = FIELD_ERROR_MAP[key as keyof typeof FIELD_ERROR_MAP];

    if (!mappedKey || value.length === 0) {
      return errors;
    }

    errors[mappedKey] = value[0];
    return errors;
  }, {});
}

export function getSummaryQuickFilter(summary: CrmSummary, quickFilter: FollowUpTiming) {
  if (quickFilter === 'today') {
    return summary.todayFollowups;
  }

  if (quickFilter === 'overdue') {
    return summary.overdueFollowups;
  }

  return summary.totalLeads;
}

export async function getSummary(projectId: number): Promise<CrmSummary> {
  const response = await apiClient.get<ApiSuccessResponse<BackendCrmSummaryDto>>(
    'crm/summary',
    {
      params: {
        project_id: projectId,
      },
    },
  );

  return mapSummary(response.data.data);
}

export async function getLeads(
  projectId: number,
  filters: CrmFilters = defaultCrmFilters,
  pagination: CrmPagination = { page: 1, perPage: 20 },
) {
  const builtParams = buildLeadListParams(projectId, filters, pagination);

  if (builtParams.skipRequest) {
    return {
      data: [],
      meta: {
        currentPage: pagination.page,
        lastPage: 1,
        perPage: pagination.perPage,
        total: 0,
      } satisfies CrmPaginationMeta,
    };
  }

  const response = await apiClient.get<
    ApiSuccessResponse<BackendLeadListDto[], BackendCrmPaginationMetaDto>
  >('crm/leads', {
    params: builtParams.params,
  });

  return {
    data: response.data.data.map(mapLeadListRecord),
    meta: mapPaginationMeta(response.data.meta),
  };
}

export async function getLead(id: number): Promise<LeadDetailRecord> {
  const response = await apiClient.get<ApiSuccessResponse<BackendLeadDetailDto>>(
    `crm/leads/${id}`,
  );

  return mapLeadDetailRecord(response.data.data);
}

export async function getHistory(id: number): Promise<LeadHistoryRecord[]> {
  const response = await apiClient.get<ApiSuccessResponse<BackendLeadHistoryDto[]>>(
    `crm/leads/${id}/history`,
  );

  return response.data.data.map(mapLeadHistoryRecord);
}

export async function createLead(input: CreateLeadInput) {
  const response = await apiClient.post<ApiSuccessResponse<BackendCreateLeadResponseDto>>(
    'crm/leads',
    toCreateLeadRequest(input),
  );

  return { id: resolveCreatedLeadId(response.data.data) };
}

export async function updateLead(id: number, input: UpdateLeadInput) {
  await apiClient.put<ApiSuccessResponse<Record<string, unknown>>>(
    `crm/leads/${id}`,
    toUpdateLeadRequest(input),
  );

  return { id };
}

export async function updateFollowUp(id: number, input: UpdateFollowUpInput) {
  await apiClient.post<ApiSuccessResponse<Record<string, unknown>>>(
    `crm/leads/${id}/follow-up`,
    toUpdateFollowUpRequest(input),
  );

  return { id };
}
