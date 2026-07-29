import { useEffect, useMemo, useState } from 'react';

import {
  AppTabScaffold,
  EmptyState,
  InlineMessage,
  SkeletonCard,
} from '@/components';
import { AttendanceHeader } from '@/features/attendance/components/AttendanceHeader';
import { TodayAttendanceCard } from '@/features/attendance/components/TodayAttendanceCard';
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { formatAttendanceCurrentDate } from '@/features/attendance/utils/attendanceDateTime';
import { useAuthStore } from '@/store/authStore';

export const attendanceScreenContentContainerStyle = {
  paddingBottom: 16,
};

export function AttendanceScreen() {
  const roles = useAuthStore((state) => state.roles);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const projects = useAuthStore((state) => state.projects);
  const role = resolvePrimaryRole(roles);
  const todayAttendance = useAttendanceStore((state) => state.todayAttendance);
  const todayProjectId = useAttendanceStore((state) => state.todayProjectId);
  const isLoadingToday = useAttendanceStore((state) => state.isLoadingToday);
  const isSubmitting = useAttendanceStore((state) => state.isSubmitting);
  const todayError = useAttendanceStore((state) => state.todayError);
  const loadTodayAttendance = useAttendanceStore(
    (state) => state.loadTodayAttendance,
  );
  const submitCheckIn = useAttendanceStore((state) => state.submitCheckIn);
  const submitCheckOut = useAttendanceStore((state) => state.submitCheckOut);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;
  const activeProject =
    projects.find((project) => project.id === todayProjectId) ??
    selectedProject;
  const attendance = todayAttendance ?? {
    canCheckIn: true,
    canCheckOut: false,
    checkInTime: null,
    checkOutTime: null,
    date: '2026-07-29',
    status: 'not_checked_in' as const,
  };
  const dateLabel = useMemo(
    () => formatAttendanceCurrentDate(attendance.date),
    [attendance.date],
  );

  useEffect(() => {
    if (!selectedProject?.id) {
      return;
    }

    void loadTodayAttendance(selectedProject.id);
  }, [loadTodayAttendance, selectedProject?.id]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(() => {
      setNotice(null);
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [notice]);

  if (!selectedProject) {
    return (
      <AppTabScaffold
        contentContainerStyle={attendanceScreenContentContainerStyle}
        items={getBottomNavigationItems(role)}
        selectedKey="attendance"
        testID="attendance-screen"
      >
        <EmptyState
          subtitle="Select a project to continue with staff attendance."
          title="Attendance unavailable"
        />
      </AppTabScaffold>
    );
  }

  return (
    <AppTabScaffold
      contentContainerStyle={attendanceScreenContentContainerStyle}
      items={getBottomNavigationItems(role)}
      selectedKey="attendance"
      testID="attendance-screen"
    >
      <AttendanceHeader
        dateLabel={dateLabel}
        projectLabel={activeProject?.name ?? selectedProject.name}
        subtitle={
          todayAttendance?.status === 'checked_in'
            ? 'Attendance stays tied to the project used during check-in.'
            : undefined
        }
      />

      {notice ? (
        <InlineMessage message={notice} title="Attendance" tone="success" />
      ) : null}
      {todayError ? (
        <InlineMessage message={todayError} title="Attendance" tone="danger" />
      ) : null}

      {isLoadingToday && !todayAttendance ? (
        <SkeletonCard />
      ) : (
        <TodayAttendanceCard
          attendance={attendance}
          isSubmitting={isSubmitting}
          onCheckIn={() => {
            void submitCheckIn(selectedProject.id).then((result) => {
              if (result) {
                setNotice('Checked in successfully.');
              }
            });
          }}
          onCheckOut={() => {
            void submitCheckOut().then((result) => {
              if (result) {
                setNotice('Checked out successfully.');
              }
            });
          }}
          projectLabel={activeProject?.name ?? selectedProject.name}
        />
      )}
    </AppTabScaffold>
  );
}
