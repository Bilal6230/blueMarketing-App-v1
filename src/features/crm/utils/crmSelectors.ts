import { getCrmStatusLabel } from '@/features/crm/data/crmMetadata';

export type LeadRecordState = 'active' | 'inactive';
export type FollowUpTiming = 'overdue' | 'today' | 'upcoming' | 'none';

export function getLeadFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export function getLeadInitials(firstName: string, lastName: string) {
  const parts = [firstName, lastName].filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .join('');
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseApiDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value.replace(' ', 'T'));

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function getFollowUpTiming(
  followUp: string | null,
  now: Date = new Date(),
): FollowUpTiming {
  const parsedDate = parseApiDateTime(followUp);

  if (!parsedDate) {
    return 'none';
  }

  const currentDay = startOfDay(now).getTime();
  const followUpDay = startOfDay(parsedDate).getTime();

  if (followUpDay < currentDay) {
    return 'overdue';
  }

  if (followUpDay === currentDay) {
    return 'today';
  }

  return 'upcoming';
}

export function formatLeadFollowUpLabel(
  followUp: string | null,
  now: Date = new Date(),
) {
  const parsedDate = parseApiDateTime(followUp);
  const timing = getFollowUpTiming(followUp, now);

  if (!parsedDate) {
    return 'No follow-up scheduled';
  }

  if (timing === 'overdue') {
    const diffMs = startOfDay(now).getTime() - startOfDay(parsedDate).getTime();
    const diffDays = Math.max(Math.round(diffMs / 86400000), 1);
    return `Overdue by ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }

  const timeLabel = new Intl.DateTimeFormat('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);

  if (timing === 'today') {
    return `Today, ${timeLabel}`;
  }

  return new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(parsedDate);
}

export function formatInfoDateTime(value: string | null) {
  const parsedDate = parseApiDateTime(value);

  if (!parsedDate) {
    return null;
  }

  return new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export function formatHistoryDuration(durationSeconds: number | null) {
  if (durationSeconds === null || durationSeconds <= 0) {
    return null;
  }

  const minutes = Math.max(Math.round(durationSeconds / 60), 1);

  return `${minutes} min`;
}

export function getRecordStateLabel(recordState: LeadRecordState) {
  return recordState === 'active' ? 'Active' : 'Inactive';
}

export function getHistoryStatusLabel(callStatus: number | null) {
  return getCrmStatusLabel(callStatus) ?? 'Follow-up';
}
