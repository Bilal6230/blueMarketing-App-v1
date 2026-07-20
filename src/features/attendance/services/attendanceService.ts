import { attendanceFixtures } from '@/features/attendance/data/attendanceFixtures';
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatDuration,
  formatTimeLabel,
} from '@/utils/dateTime';

export type AttendanceStatus = 'checked_in' | 'checked_out' | 'not_checked_in';

export type AttendanceRecord = {
  body: string;
  id: string;
  time: string;
  title: string;
};

export type AttendanceSummary = {
  currentDateLabel: string;
  currentProjectLabel: string;
  currentTimeline: AttendanceRecord[];
  history: string[];
  primaryActionLabel: string;
  primaryMessage: string;
  primarySubtitle: string;
  progress: number;
  status: AttendanceStatus;
  weekly: { label: string; progress: number }[];
};

export function createAttendanceSummary(params: {
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  projectName: string;
}) {
  const now = new Date();
  const { checkedInAt, checkedOutAt, projectName } = params;
  const currentDateLabel = formatDateLabel(now);
  const currentProjectLabel = `${projectName} · ${currentDateLabel}`;

  if (!checkedInAt) {
    return {
      currentDateLabel,
      currentProjectLabel,
      currentTimeline: [],
      history: attendanceFixtures.history.map((entry) =>
        entry.replace(/Â/g, '').replace(/â€¢/g, '•'),
      ),
      primaryActionLabel: 'Check in',
      primaryMessage: 'You have not checked in',
      primarySubtitle: currentProjectLabel,
      progress: 0,
      status: 'not_checked_in' as AttendanceStatus,
      weekly: attendanceFixtures.weekly,
    };
  }

  const checkInEntry: AttendanceRecord = {
    body: `Checked in at ${formatTimeLabel(checkedInAt)}.`,
    id: 'today-check-in',
    time: formatDateTimeLabel(checkedInAt),
    title: 'Check-in recorded',
  };

  if (!checkedOutAt) {
    return {
      currentDateLabel,
      currentProjectLabel,
      currentTimeline: [checkInEntry],
      history: attendanceFixtures.history.map((entry) =>
        entry.replace(/Â/g, '').replace(/â€¢/g, '•'),
      ),
      primaryActionLabel: 'Check out',
      primaryMessage: `Checked in at ${formatTimeLabel(checkedInAt)}`,
      primarySubtitle: `Working for ${formatDuration(checkedInAt, now)}`,
      progress: 0.45,
      status: 'checked_in' as AttendanceStatus,
      weekly: attendanceFixtures.weekly,
    };
  }

  return {
    currentDateLabel,
    currentProjectLabel,
    currentTimeline: [
      {
        body: `Checked out at ${formatTimeLabel(checkedOutAt)}.`,
        id: 'today-check-out',
        time: formatDateTimeLabel(checkedOutAt),
        title: 'Check-out recorded',
      },
      checkInEntry,
    ],
    history: attendanceFixtures.history.map((entry) =>
      entry.replace(/Â/g, '').replace(/â€¢/g, '•'),
    ),
    primaryActionLabel: 'Shift completed',
    primaryMessage: `Checked out at ${formatTimeLabel(checkedOutAt)}`,
    primarySubtitle: `Worked for ${formatDuration(checkedInAt, checkedOutAt)}`,
    progress: 1,
    status: 'checked_out' as AttendanceStatus,
    weekly: attendanceFixtures.weekly,
  };
}
