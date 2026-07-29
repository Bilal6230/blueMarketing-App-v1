import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import { AttendanceStatusIcon } from '@/features/attendance/components/AttendanceStatusIcon';
import type { TodayAttendance } from '@/features/attendance/services/attendanceService';
import {
  formatAttendanceDuration,
  formatAttendanceTime,
  formatElapsedAttendanceDuration,
} from '@/features/attendance/utils/attendanceDateTime';
import { useAppTheme } from '@/hooks/useAppTheme';

type TodayAttendanceCardProps = {
  attendance: TodayAttendance;
  isSubmitting: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  projectLabel: string;
};

type PendingAction = 'check_in' | 'check_out' | null;

export function TodayAttendanceCard({
  attendance,
  isSubmitting,
  onCheckIn,
  onCheckOut,
  projectLabel,
}: TodayAttendanceCardProps) {
  const { theme } = useAppTheme();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (attendance.status !== 'checked_in') {
      return;
    }

    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [attendance.status]);

  const elapsedLabel = useMemo(
    () => formatElapsedAttendanceDuration(attendance.checkInTime, now),
    [attendance.checkInTime, now],
  );
  const completedDuration = useMemo(
    () =>
      formatAttendanceDuration(attendance.checkInTime, attendance.checkOutTime),
    [attendance.checkInTime, attendance.checkOutTime],
  );

  return (
    <>
      <AppCard style={styles.card} surface="elevated">
        <View style={styles.header}>
          <AttendanceStatusIcon status={attendance.status} />
          <View style={styles.headerCopy}>
            <AppText variant="headingSmall">
              {attendance.status === 'checked_out'
                ? 'Attendance complete'
                : attendance.status === 'checked_in'
                  ? 'You\u2019re checked in'
                  : 'Ready to start'}
            </AppText>
            <AppText color="textSecondary" variant="body">
              {attendance.status === 'checked_out'
                ? 'Today\u2019s attendance is complete.'
                : attendance.status === 'checked_in'
                  ? `Attendance is active for ${projectLabel}.`
                  : 'No attendance recorded yet.'}
            </AppText>
          </View>
        </View>

        {attendance.status === 'checked_out' ? (
          <View style={styles.completedWrap}>
            <View style={styles.dualValueRow}>
              <View style={styles.valueBlock}>
                <AppText color="textSecondary" variant="captionStrong">
                  Check in
                </AppText>
                <AppText variant="numericLarge">
                  {formatAttendanceTime(attendance.checkInTime)}
                </AppText>
              </View>
              <View style={styles.valueBlock}>
                <AppText color="textSecondary" variant="captionStrong">
                  Check out
                </AppText>
                <AppText variant="numericLarge">
                  {formatAttendanceTime(attendance.checkOutTime)}
                </AppText>
              </View>
            </View>
            <View style={styles.durationBlock}>
              <AppText color="textSecondary" variant="captionStrong">
                Duration
              </AppText>
              <AppText variant="numericLarge">
                {completedDuration ?? '\u2014'}
              </AppText>
            </View>
          </View>
        ) : attendance.status === 'checked_in' ? (
          <View style={styles.activeWrap}>
            <AppText variant="displayMedium">
              {formatAttendanceTime(attendance.checkInTime)}
            </AppText>
            <View style={styles.durationBlock}>
              <AppText color="textSecondary" variant="captionStrong">
                Elapsed today
              </AppText>
              <AppText variant="numericLarge">
                {elapsedLabel ?? '00h 00m'}
              </AppText>
            </View>
            <ActionButton
              accessibilityLabel="Check out"
              busy={isSubmitting}
              disabled={isSubmitting}
              label="Check out"
              onPress={() => setPendingAction('check_out')}
              testID="attendance-check-out-button"
            />
          </View>
        ) : (
          <View style={styles.idleWrap}>
            <ActionButton
              accessibilityLabel="Check in"
              busy={isSubmitting}
              disabled={isSubmitting}
              label="Check in"
              onPress={() => setPendingAction('check_in')}
              testID="attendance-check-in-button"
            />
          </View>
        )}
      </AppCard>

      <Modal
        animationType="fade"
        onRequestClose={() => setPendingAction(null)}
        transparent
        visible={pendingAction !== null}
      >
        <Pressable
          accessibilityLabel="Close attendance confirmation"
          onPress={() => setPendingAction(null)}
          style={[styles.modalScrim, { backgroundColor: theme.colors.overlay }]}
        >
          <Pressable
            onPress={() => undefined}
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <AppText variant="headingSmall">
              {pendingAction === 'check_out'
                ? 'Finish attendance?'
                : 'Start attendance?'}
            </AppText>
            <AppText color="textSecondary" variant="body">
              {pendingAction === 'check_out'
                ? 'You will not be able to check in again today.'
                : projectLabel}
            </AppText>
            <View style={styles.modalActions}>
              <ActionButton
                accessibilityLabel="Cancel attendance action"
                busy={false}
                disabled={false}
                label="Cancel"
                onPress={() => setPendingAction(null)}
                variant="secondary"
              />
              <ActionButton
                accessibilityLabel={
                  pendingAction === 'check_out'
                    ? 'Confirm check out'
                    : 'Confirm check in'
                }
                busy={isSubmitting}
                disabled={isSubmitting}
                label={pendingAction === 'check_out' ? 'Check out' : 'Check in'}
                onPress={() => {
                  if (pendingAction === 'check_out') {
                    onCheckOut();
                  } else {
                    onCheckIn();
                  }

                  setPendingAction(null);
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type ActionButtonProps = {
  accessibilityLabel: string;
  busy: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: 'primary' | 'secondary';
};

function ActionButton({
  accessibilityLabel,
  busy,
  disabled,
  label,
  onPress,
  testID,
  variant = 'primary',
}: ActionButtonProps) {
  const { theme } = useAppTheme();
  const backgroundColor =
    variant === 'secondary'
      ? theme.colors.surfaceMuted
      : theme.component.button.variants.primary.background;
  const pressedColor =
    variant === 'secondary'
      ? theme.colors.border
      : theme.component.button.variants.primary.backgroundPressed;
  const textColor =
    variant === 'secondary' ? theme.colors.textPrimary : '#FFFFFF';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? theme.component.button.variants.primary.backgroundDisabled
            : pressed
              ? pressedColor
              : backgroundColor,
          opacity: disabled ? 0.78 : 1,
        },
      ]}
      testID={testID}
    >
      <AppText style={{ color: textColor }} variant="labelStrong">
        {busy ? 'Please wait' : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeWrap: {
    gap: 14,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    width: '100%',
  },
  card: {
    backgroundColor: '#F9FCFF',
    borderRadius: 20,
    gap: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  completedWrap: {
    gap: 14,
  },
  dualValueRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  durationBlock: {
    gap: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  idleWrap: {
    gap: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 18,
    padding: 20,
    width: '100%',
  },
  modalScrim: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  valueBlock: {
    flex: 1,
    gap: 4,
  },
});
