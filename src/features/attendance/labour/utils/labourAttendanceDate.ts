const TODAY = '2026-07-29';

export function getTodayLabourAttendanceDate() {
  return TODAY;
}

export function formatLabourAttendanceDate(date: string) {
  const [year = 2026, month = 7, day = 29] = date.split('-').map(Number);

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
}
