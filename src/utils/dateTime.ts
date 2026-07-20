export function getGreeting(now: Date) {
  const hour = now.getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export function getFirstName(name: string | null | undefined) {
  if (!name) {
    return 'there';
  }

  const [firstName] = name.trim().split(/\s+/);

  return firstName || 'there';
}

export function formatDateLabel(now: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(now);
}

export function formatTimeLabel(now: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(now);
}

export function formatDateTimeLabel(now: Date, locale?: string) {
  return `${formatDateLabel(now, locale)} · ${formatTimeLabel(now, locale)}`;
}

export function formatDuration(start: Date, end: Date) {
  const diffMs = Math.max(end.getTime() - start.getTime(), 0);
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

export function toIsoDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseIsoDateInput(value: string) {
  const trimmedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return null;
  }

  const parsedDate = new Date(`${trimmedValue}T09:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}
