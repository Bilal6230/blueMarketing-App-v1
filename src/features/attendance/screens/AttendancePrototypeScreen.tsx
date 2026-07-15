import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppText,
  HeroMetricCard,
  ProgressBar,
  Screen,
  SegmentedControl,
  TimelineItem,
} from '@/components';
import { attendanceMock } from '@/mocks/attendance';
import {
  lightImpactFeedback,
  selectionFeedback,
  successFeedback,
} from '@/services/haptics';

type AttendanceState = 'not_checked_in' | 'checked_in' | 'checked_out';

export function AttendancePrototypeScreen() {
  const [state, setState] = useState<AttendanceState>('not_checked_in');

  const hero =
    state === 'checked_in'
      ? {
          subtitle: attendanceMock.checkedIn.duration,
          title: attendanceMock.checkedIn.headline,
        }
      : state === 'checked_out'
        ? {
            subtitle: 'Shift completed for today',
            title: 'Checked out at 6:05 PM',
          }
        : {
            subtitle: 'Blue Residency · Wednesday, 15 July',
            title: 'You have not checked in',
          };

  return (
    <Screen>
      <SegmentedControl
        accessibilityLabel="Attendance state switcher"
        onChange={async (value) => {
          await selectionFeedback();
          setState(value);
        }}
        options={[
          { label: 'Not checked in', value: 'not_checked_in' },
          { label: 'Checked in', value: 'checked_in' },
          { label: 'Checked out', value: 'checked_out' },
        ]}
        value={state}
      />

      <HeroMetricCard
        caption="Attendance hero"
        progress={
          state === 'checked_in' ? 0.45 : state === 'checked_out' ? 1 : 0
        }
        subtitle={hero.subtitle}
        title={hero.title}
      />

      <AppButton
        onPress={async () => {
          if (state === 'checked_in') {
            await successFeedback();
            setState('checked_out');
            return;
          }

          await lightImpactFeedback();
          setState('checked_in');
        }}
        title={state === 'checked_in' ? 'Check out' : 'Check in now'}
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
    </Screen>
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
