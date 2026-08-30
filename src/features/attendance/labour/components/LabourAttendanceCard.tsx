import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type {
  LabourAttendanceDraft,
  LabourAttendanceStatus,
  LabourRecord,
} from '@/features/attendance/labour/services/labourAttendanceService';
import {
  calculateEstimatedAttendanceAmount,
  formatPkrAmount,
  getDailyWageNumber,
} from '@/features/attendance/labour/utils/labourAttendanceCalculations';
import { selectionFeedback } from '@/services/haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

type LabourAttendanceCardProps = {
  draft?: LabourAttendanceDraft;
  isMarkingDisabled: boolean;
  isReadOnlySaved: boolean;
  labour: LabourRecord;
  onEditDetails: () => void;
  onMarkAbsent: () => void;
  onMarkPresent: () => void;
};

export function LabourAttendanceCard({
  draft,
  isMarkingDisabled,
  isReadOnlySaved,
  labour,
  onEditDetails,
  onMarkAbsent,
  onMarkPresent,
}: LabourAttendanceCardProps) {
  const { theme } = useAppTheme();
  const status = draft?.status ?? labour.todayAttendance?.status ?? null;
  const hours =
    draft?.hours ??
    (labour.todayAttendance ? Number(labour.todayAttendance.hours) : 0);
  const overtimeHours =
    draft?.overtimeHours ??
    (labour.todayAttendance ? Number(labour.todayAttendance.overtimeHours) : 0);
  const rate = draft?.rate ?? getDailyWageNumber(labour);
  const estimatedAmount = calculateEstimatedAttendanceAmount(
    hours,
    overtimeHours,
    rate,
  );
  const initials = labour.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppCard style={styles.card} surface="elevated">
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                status === 'present'
                  ? theme.colors.successSoft
                  : status === 'absent'
                    ? theme.colors.dangerSoft
                    : theme.colors.primarySoft,
            },
          ]}
        >
          <AppText
            style={{
              color:
                status === 'present'
                  ? theme.colors.success
                  : status === 'absent'
                    ? theme.colors.danger
                    : theme.colors.primary,
            }}
            variant="labelStrong"
          >
            {initials}
          </AppText>
        </View>
        <View style={styles.headerCopy}>
          <AppText numberOfLines={1} variant="title">
            {labour.name}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="body">
            {[
              labour.role,
              labour.maskedPhone,
            ]
              .filter(Boolean)
              .join(' \u00B7 ')}
          </AppText>
          {labour.fatherName ? (
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {`Father: ${labour.fatherName}`}
            </AppText>
          ) : null}
          <AppText color="textSecondary" variant="captionStrong">
            {`Daily wage: ${formatPkrAmount(getDailyWageNumber(labour))}`}
          </AppText>
        </View>
        {labour.todayAttendance && !draft ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.surfaceMuted,
              },
            ]}
          >
            <AppText color="textSecondary" variant="captionStrong">
              Saved
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.statusRow}>
        <StatusButton
          disabled={isMarkingDisabled}
          label="Present"
          onPress={() => {
            void selectionFeedback();
            onMarkPresent();
          }}
          selected={status === 'present'}
          tone="present"
        />
        <StatusButton
          disabled={isMarkingDisabled}
          label="Absent"
          onPress={() => {
            void selectionFeedback();
            onMarkAbsent();
          }}
          selected={status === 'absent'}
          tone="absent"
        />
      </View>

      {status === 'present' ? (
        <View style={styles.detailsBox}>
          <AppText color="textSecondary" variant="body">
            {hours === 8
              ? `Full day \u00B7 ${hours}h \u00B7 ${
                  overtimeHours > 0 ? `${overtimeHours}h overtime` : 'No overtime'
                }`
              : hours === 4
                ? `Half day \u00B7 ${hours}h \u00B7 ${
                    overtimeHours > 0
                      ? `${overtimeHours}h overtime`
                      : 'No overtime'
                  }`
                : `${hours}h \u00B7 ${
                    overtimeHours > 0
                      ? `${overtimeHours}h overtime`
                      : 'No overtime'
                  }`}
          </AppText>
          <AppText color="textSecondary" variant="captionStrong">
            {`Estimated amount: ${formatPkrAmount(estimatedAmount)}`}
          </AppText>
          {isReadOnlySaved ? (
            <AppText color="textSecondary" variant="captionStrong">
              Already marked.
            </AppText>
          ) : null}
        </View>
      ) : status === 'absent' ? (
        <View style={styles.detailsBox}>
          <AppText color="textSecondary" variant="body">
            Absent for today
          </AppText>
          {isReadOnlySaved ? (
            <AppText color="textSecondary" variant="captionStrong">
              Already marked.
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <Pressable
          accessibilityLabel="Edit labour attendance details"
          accessibilityRole="button"
          accessibilityState={{
            disabled: isMarkingDisabled || isReadOnlySaved || status === null,
          }}
          disabled={isMarkingDisabled || isReadOnlySaved || status === null}
          onPress={onEditDetails}
          style={({ pressed }) => [
            styles.linkButton,
            {
              opacity:
                isMarkingDisabled || isReadOnlySaved || status === null
                  ? 0.45
                  : pressed
                    ? 0.7
                    : 1,
            },
          ]}
        >
          <AppText color="primary" variant="labelStrong">
            Edit details
          </AppText>
        </Pressable>
      </View>
    </AppCard>
  );
}

type StatusButtonProps = {
  disabled: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  tone: 'absent' | 'present';
};

function StatusButton({
  disabled,
  label,
  onPress,
  selected,
  tone,
}: StatusButtonProps) {
  const { theme } = useAppTheme();
  const selectedBackground =
    tone === 'present' ? theme.colors.successSoft : theme.colors.dangerSoft;
  const selectedText =
    tone === 'present' ? theme.colors.success : theme.colors.danger;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.statusButton,
        {
          backgroundColor: selected
            ? selectedBackground
            : theme.colors.surfaceMuted,
          borderColor: selected ? selectedText : theme.colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText
        style={{ color: selected ? selectedText : theme.colors.textSecondary }}
        variant="labelStrong"
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  card: {
    gap: 14,
  },
  detailsBox: {
    gap: 4,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  statusButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
