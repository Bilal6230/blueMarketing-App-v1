import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
import { attendanceFixtures } from '@/features/attendance/data/attendanceFixtures';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { lightImpactFeedback, successFeedback } from '@/services/haptics';

type AttendanceState = 'not_checked_in' | 'checked_in' | 'checked_out';

export function AttendancePrototypeScreen() {
  const [notice, setNotice] = useState<string | null>(null);
  const [state, setState] = useState<AttendanceState>('not_checked_in');

  const hero =
    state === 'checked_in'
      ? {
          subtitle: 'Working for 02h 14m',
          title: 'Checked in at 8:56 AM',
        }
      : state === 'checked_out'
        ? {
            subtitle: 'Shift completed for Sunday, July 19, 2026',
            title: 'Checked out at 6:05 PM',
          }
        : {
            subtitle: attendanceFixtures.projectLabel,
            title: 'You have not checked in',
          };

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      selectedKey="attendance"
      testID="attendance-screen"
    >
      {notice ? (
        <InlineMessage
          message={notice}
          title="Attendance update"
          tone="information"
        />
      ) : null}

      <AppCard surface="muted">
        <AppText variant="labelStrong">Project and shift context</AppText>
        <AppText color="textSecondary" variant="caption">
          {attendanceFixtures.projectLabel}
        </AppText>
      </AppCard>

      <HeroMetricCard
        caption="Attendance"
        progress={
          state === 'checked_in' ? 0.45 : state === 'checked_out' ? 1 : 0
        }
        subtitle={hero.subtitle}
        title={hero.title}
      />

      <AppButton
        disabled={state === 'checked_out'}
        onPress={async () => {
          if (state === 'checked_in') {
            await successFeedback();
            setState('checked_out');
            setNotice(
              'Your local attendance state has been updated to checked out.',
            );
            return;
          }

          await lightImpactFeedback();
          setState('checked_in');
          setNotice(
            'Your local attendance state has been updated to checked in.',
          );
        }}
        testID="attendance-primary-action"
        title={
          state === 'checked_in'
            ? 'Check out'
            : state === 'checked_out'
              ? 'Shift completed'
              : 'Check in now'
        }
        variant={state === 'checked_out' ? 'secondary' : 'primary'}
      />

      <AppCard>
        <AppText variant="headingSmall">Weekly overview</AppText>
        <View style={styles.weekly}>
          {attendanceFixtures.weekly.map((item) => (
            <View key={item.label} style={styles.weekItem}>
              <AppText variant="labelStrong">{item.label}</AppText>
              <ProgressBar progress={item.progress} />
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="headingSmall">Recent attendance history</AppText>
        {attendanceFixtures.history.map((item, index) => (
          <TimelineItem
            body={item}
            key={item}
            time={`Entry ${index + 1}`}
            title="Attendance record"
          />
        ))}
      </AppCard>
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  weekItem: {
    gap: 6,
  },
  weekly: {
    gap: 12,
  },
});
