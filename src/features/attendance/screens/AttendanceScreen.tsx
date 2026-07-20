import { useMemo, useState } from 'react';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  HeroMetricCard,
  InlineMessage,
  ProgressBar,
  TimelineItem,
} from '@/components';
import { createAttendanceSummary } from '@/features/attendance/services/attendanceService';
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAuthStore } from '@/store/authStore';

export function AttendanceScreen() {
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const projects = useAuthStore((state) => state.projects);
  const projectName =
    projects.find((project) => project.id === selectedProjectId)?.name ??
    'Blue Residency';
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const checkOut = useAttendanceStore((state) => state.checkOut);
  const checkedInAt = useAttendanceStore((state) => state.checkedInAt);
  const checkedOutAt = useAttendanceStore((state) => state.checkedOutAt);
  const [notice, setNotice] = useState<string | null>(null);
  const summary = useMemo(
    () =>
      createAttendanceSummary({
        checkedInAt,
        checkedOutAt,
        projectName,
      }),
    [projectName, checkedInAt, checkedOutAt],
  );

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      selectedKey="attendance"
      testID="attendance-screen"
    >
      {notice ? (
        <InlineMessage message={notice} title="Attendance" tone="success" />
      ) : null}

      <AppCard surface="muted">
        <AppText variant="labelStrong">Project and shift context</AppText>
        <AppText color="textSecondary" variant="caption">
          {summary.currentProjectLabel}
        </AppText>
      </AppCard>

      <HeroMetricCard
        caption="Attendance"
        progress={summary.progress}
        subtitle={summary.primarySubtitle}
        title={summary.primaryMessage}
      />

      <AppButton
        disabled={summary.status === 'checked_out'}
        onPress={() => {
          if (summary.status === 'checked_in') {
            const result = checkOut();

            if (result.ok) {
              setNotice('Checked out successfully.');
            }

            return;
          }

          const result = checkIn();

          if (result.ok) {
            setNotice('Checked in successfully.');
          }
        }}
        testID="attendance-primary-action"
        title={summary.primaryActionLabel}
        variant={summary.status === 'checked_out' ? 'secondary' : 'primary'}
      />

      <AppCard>
        <AppText variant="headingSmall">Today</AppText>
        {summary.currentTimeline.length === 0 ? (
          <AppText color="textSecondary" variant="body">
            Start your shift to record today&apos;s attendance activity.
          </AppText>
        ) : (
          summary.currentTimeline.map((item) => (
            <TimelineItem
              body={item.body}
              key={item.id}
              time={item.time}
              title={item.title}
            />
          ))
        )}
      </AppCard>

      <AppCard>
        <AppText variant="headingSmall">Weekly overview</AppText>
        {summary.weekly.map((item) => (
          <TimelineItem
            body={`${Math.round(item.progress * 100)}% shift completion`}
            key={item.label}
            time={item.label}
            title="Weekly attendance"
          />
        ))}
        <ProgressBar
          progress={
            summary.weekly.reduce((sum, item) => sum + item.progress, 0) /
            summary.weekly.length
          }
        />
      </AppCard>

      <AppCard>
        <AppText variant="headingSmall">Recent attendance history</AppText>
        {summary.history.map((item, index) => (
          <TimelineItem
            body={item}
            key={`${item}-${index}`}
            time={`Entry ${index + 1}`}
            title="Attendance record"
          />
        ))}
      </AppCard>
    </AppTabScaffold>
  );
}
