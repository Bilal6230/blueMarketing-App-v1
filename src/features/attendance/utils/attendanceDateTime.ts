function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatServerDate(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function formatServerDateTime(value: Date) {
  return `${formatServerDate(value)} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

export function parseAttendanceDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseAttendanceDateTime(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [datePart, timePart] = value.split(' ');

  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  if (
    !year ||
    !month ||
    !day ||
    hour === undefined ||
    minute === undefined ||
    second === undefined
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, second, 0);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function compareAttendanceDateTime(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  const leftTime = parseAttendanceDateTime(left)?.getTime() ?? 0;
  const rightTime = parseAttendanceDateTime(right)?.getTime() ?? 0;

  return leftTime - rightTime;
}

export function formatAttendanceCurrentDate(value: string, locale?: string) {
  const parsed = parseAttendanceDate(value);

  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(parsed);
}

export function formatAttendanceShortDate(value: string, locale?: string) {
  const parsed = parseAttendanceDate(value);

  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(parsed);
}

export function formatAttendanceTime(
  value: string | null | undefined,
  locale?: string,
) {
  const parsed = parseAttendanceDateTime(value);

  if (!parsed) {
    return '\u2014';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function formatAttendanceDuration(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  const startDate = parseAttendanceDateTime(start);
  const endDate = parseAttendanceDateTime(end);

  if (!startDate || !endDate) {
    return null;
  }

  const diffMs = Math.max(endDate.getTime() - startDate.getTime(), 0);
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${pad(hours)}h ${pad(minutes)}m`;
}

export function formatElapsedAttendanceDuration(
  start: string | null | undefined,
  now: Date = new Date(),
) {
  const startDate = parseAttendanceDateTime(start);

  if (!startDate) {
    return null;
  }

  const diffMs = Math.max(now.getTime() - startDate.getTime(), 0);
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${pad(hours)}h ${pad(minutes)}m`;
}
