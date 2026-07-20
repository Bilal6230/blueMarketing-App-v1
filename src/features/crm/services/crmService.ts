import type { LeadStatus } from '@/features/crm/data/leadFixtures';
import { leadFixtures } from '@/features/crm/data/leadFixtures';
import { formatDateTimeLabel } from '@/utils/dateTime';

export type LeadTimelineEntry = {
  body: string;
  id: string;
  time: string;
  title: string;
};

export type LeadRecord = {
  assignedTo: string;
  email: string;
  followUp: string;
  followUpDate: string;
  fullPhone: string;
  id: string;
  initials: string;
  maskedPhone: string;
  name: string;
  project: string;
  status: LeadStatus;
  statusTone: 'active' | 'overdue' | 'pending';
  timeline: LeadTimelineEntry[];
};

function toStatusTone(status: LeadStatus): LeadRecord['statusTone'] {
  return status === 'Overdue'
    ? 'overdue'
    : status === 'Pending'
      ? 'pending'
      : 'active';
}

export type LeadFilterStatus = 'All' | LeadStatus;

export type LeadFilters = {
  search?: string;
  status?: LeadFilterStatus;
};

export type AddFollowUpInput = {
  note: string;
  scheduledFor: Date;
};

export type UpdateLeadInput = {
  assignedTo: string;
  email: string;
  followUpDate: Date;
  status: LeadStatus;
};

const initialLeadData: LeadRecord[] = leadFixtures.map((lead) => ({
  assignedTo: lead.assignedTo,
  email: lead.email,
  followUp: lead.followUp,
  followUpDate:
    lead.id === 'lead-1'
      ? '2026-07-19'
      : lead.id === 'lead-2'
        ? '2026-07-18'
        : '2026-07-20',
  fullPhone:
    lead.id === 'lead-1'
      ? '+923001112242'
      : lead.id === 'lead-2'
        ? '+923001112251'
        : '+923001112263',
  id: lead.id,
  initials: lead.initials,
  maskedPhone: lead.maskedPhone.replace(/â€¢/g, '•').replace(/Â/g, ''),
  name: lead.name,
  project: lead.project,
  status: lead.status,
  statusTone: lead.statusTone,
  timeline: lead.timeline.map((entry, index) => ({
    body: entry.body,
    id: `${lead.id}-timeline-${index + 1}`,
    time: entry.time.replace(/Â/g, '').replace(/â€™/g, "'"),
    title: entry.title,
  })),
}));

export function createInitialLeads() {
  return initialLeadData.map((lead) => ({
    ...lead,
    timeline: lead.timeline.map((entry) => ({ ...entry })),
  }));
}

export function getLeads(filters: LeadFilters, leads: LeadRecord[]) {
  const search = filters.search?.trim().toLowerCase() ?? '';
  const status = filters.status ?? 'All';

  return leads.filter((lead) => {
    const matchesStatus = status === 'All' ? true : lead.status === status;
    const matchesSearch = search
      ? `${lead.name} ${lead.assignedTo} ${lead.project}`
          .toLowerCase()
          .includes(search)
      : true;

    return matchesStatus && matchesSearch;
  });
}

export function getLead(id: string, leads: LeadRecord[]) {
  return leads.find((lead) => lead.id === id) ?? null;
}

export function addFollowUp(lead: LeadRecord, input: AddFollowUpInput) {
  const followUpLabel = formatDateTimeLabel(input.scheduledFor);

  return {
    ...lead,
    followUp: followUpLabel,
    followUpDate: input.scheduledFor.toISOString(),
    timeline: [
      {
        body: input.note,
        id: `${lead.id}-timeline-${Date.now()}`,
        time: formatDateTimeLabel(new Date()),
        title: 'Follow-up added',
      },
      ...lead.timeline,
    ],
  };
}

export function updateLead(lead: LeadRecord, input: UpdateLeadInput) {
  return {
    ...lead,
    assignedTo: input.assignedTo,
    email: input.email,
    followUp: formatDateTimeLabel(input.followUpDate),
    followUpDate: input.followUpDate.toISOString(),
    status: input.status,
    statusTone: toStatusTone(input.status),
    timeline: [
      {
        body: `Status updated to ${input.status} and follow-up moved to ${formatDateTimeLabel(
          input.followUpDate,
        )}.`,
        id: `${lead.id}-timeline-${Date.now()}`,
        time: formatDateTimeLabel(new Date()),
        title: 'Lead updated',
      },
      ...lead.timeline,
    ],
  };
}
