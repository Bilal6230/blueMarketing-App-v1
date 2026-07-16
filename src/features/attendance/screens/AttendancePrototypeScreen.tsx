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
  SegmentedControl,
  TimelineItem,
} from '@/components';
import { staffPreviewNavigation } from '@/features/preview/navigationModel';
import { attendanceMock } from '@/mocks/attendance';
import {
  lightImpactFeedback,
  selectionFeedback,
  successFeedback,
} from '@/services/haptics';

type AttendanceState = 'not_checked_in' | 'checked_in' | 'checked_out';

export function AttendancePrototypeScreen() {
  const [notice, setNotice] = useState<string | null>(null);
  const [state, setState] = useState<AttendanceState>('not_checked_in');

  const hero =
    state === 'checked_in'
      ? {
          subtitle: attendanceMock.checkedIn.duration,
          title: attendanceMock.checkedIn.headline,
        }
      : state === 'checked_out'
        ? {
            subtitle: 'Shift completed for Thursday, July 16, 2026',
            title: 'Checked out at 6:05 PM',
          }
        : {
            subtitle: `Blue Residency \u00B7 Thursday, July 16, 2026`,
            title: 'You have not checked in',
          };

  return (
    <AppTabScaffold
      items={staffPreviewNavigation}
      selectedKey="attendance"
      testID="attendance-prototype-screen"
    >
      <SegmentedControl
        accessibilityLabel="Attendance state switcher"
        onChange={async (value) => {
          await selectionFeedback();
          setNotice(null);
          setState(value);
        }}
        options={[
          { label: 'Not checked in', value: 'not_checked_in' },
          { label: 'Checked in', value: 'checked_in' },
          { label: 'Checked out', value: 'checked_out' },
        ]}
        value={state}
      />

      {notice ? (
        <InlineMessage
          message={notice}
          title="Preview notice"
          tone="information"
        />
      ) : null}

      <AppCard surface="muted">
        <AppText variant="labelStrong">Project and shift context</AppText>
        <AppText color="textSecondary" variant="caption">
          {`Blue Residency \u00B7 Thursday, July 16, 2026`}
        </AppText>
      </AppCard>

      <HeroMetricCard
        caption="Attendance hero"
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
              'The shift has been completed. This prototype will not check you in again from the checked-out state.',
            );
            return;
          }

          await lightImpactFeedback();
          setState('checked_in');
          setNotice(
            'Attendance preview updated locally only. No backend attendance entry was created.',
          );
        }}
        title={
          state === 'checked_in'
            ? 'Check out'
            : state === 'checked_out'
              ? 'Shift completed'
              : 'Check in now'
        }
        testID="attendance-primary-action"
        variant={state === 'checked_out' ? 'secondary' : 'primary'}
      />

      <AppCard>
        <AppText variant="headingSmall">Weekly overview</AppText>
        <View style={styles.weekly}>
          {attendanceMock.weekly.map((item) => (
            <View key={item.label} style={styles.weekItem}>
              <AppText variant="labelStrong">{item.label}</AppText>
              <ProgressBar progress={item.progress} />
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="headingSmall">Recent attendance history</AppText>
        {attendanceMock.history.map((item, index) => (
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
