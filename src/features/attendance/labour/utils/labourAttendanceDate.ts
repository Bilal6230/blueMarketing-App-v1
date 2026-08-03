export function getTodayLabourAttendanceDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatLabourAttendanceDate(date?: string) {
  const fallback = new Date();
  const resolvedDate = date ?? getTodayLabourAttendanceDate();
  const [year = fallback.getFullYear(), month = fallback.getMonth() + 1, day = fallback.getDate()] =
    resolvedDate.split('-').map(Number);

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
}
