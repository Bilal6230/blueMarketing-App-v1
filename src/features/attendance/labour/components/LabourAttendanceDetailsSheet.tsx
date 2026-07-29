import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppInput, AppText } from '@/components';
import type {
  LabourAttendanceDraft,
  LabourAttendanceStatus,
  LabourRecord,
} from '@/features/attendance/labour/services/labourAttendanceService';
import {
  calculateEstimatedAttendanceAmount,
  formatPkrAmount,
} from '@/features/attendance/labour/utils/labourAttendanceCalculations';
import { selectionFeedback } from '@/services/haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

type LabourAttendanceDetailsSheetProps = {
  labour: LabourRecord;
  onApply: (
    changes: Partial<Omit<LabourAttendanceDraft, 'isDirty' | 'labourId'>>,
  ) => void;
  onClose: () => void;
  onReset: () => void;
  status: LabourAttendanceStatus;
  visible: boolean;
  initialDraft: {
    hours: number;
    overtimeHours: number;
    rate: number;
    rating: number | null;
    remarks: string;
  };
};

type DayMode = 'custom' | 'full' | 'half';

export function LabourAttendanceDetailsSheet({
  initialDraft,
  labour,
  onApply,
  onClose,
  onReset,
  status,
  visible,
}: LabourAttendanceDetailsSheetProps) {
  const { theme } = useAppTheme();
  const [hoursInput, setHoursInput] = useState(String(initialDraft.hours));
  const [overtimeInput, setOvertimeInput] = useState(
    String(initialDraft.overtimeHours),
  );
  const [rateInput, setRateInput] = useState(String(initialDraft.rate));
  const [rating, setRating] = useState<number | null>(initialDraft.rating);
  const [remarks, setRemarks] = useState(initialDraft.remarks);
  const [mode, setMode] = useState<DayMode>(
    initialDraft.hours === 8
      ? 'full'
      : initialDraft.hours === 4
        ? 'half'
        : 'custom',
  );
  const [error, setError] = useState<string | null>(null);
  const hours = Number(hoursInput || '0');
  const overtimeHours = Number(overtimeInput || '0');
  const rate = Number(rateInput || '0');
  const estimate = calculateEstimatedAttendanceAmount(hours, overtimeHours, rate);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close labour attendance details"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable
          onPress={() => undefined}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitle}>
                <AppText variant="headingSmall">Edit details</AppText>
                <AppText color="textSecondary" variant="body">
                  {labour.name}
                </AppText>
              </View>
              <Pressable
                accessibilityLabel="Close labour details"
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Ionicons
                  color={theme.colors.textSecondary}
                  name="close-outline"
                  size={24}
                />
              </Pressable>
            </View>

            {status === 'present' ? (
              <>
                <View style={styles.modeRow}>
                  <ModeButton
                    label="Full day"
                    onPress={() => {
                      void selectionFeedback();
                      setMode('full');
                      setHoursInput('8');
                    }}
                    selected={mode === 'full'}
                  />
                  <ModeButton
                    label="Half day"
                    onPress={() => {
                      void selectionFeedback();
                      setMode('half');
                      setHoursInput('4');
                    }}
                    selected={mode === 'half'}
                  />
                  <ModeButton
                    label="Custom"
                    onPress={() => {
                      void selectionFeedback();
                      setMode('custom');
                    }}
                    selected={mode === 'custom'}
                  />
                </View>

                <AppInput
                  accessibilityLabel="Custom hours"
                  keyboardType="numeric"
                  label="Hours"
                  onChangeText={setHoursInput}
                  value={hoursInput}
                />
                <AppInput
                  accessibilityLabel="Overtime hours"
                  keyboardType="numeric"
                  label="Overtime hours"
                  onChangeText={setOvertimeInput}
                  value={overtimeInput}
                />
                <AppInput
                  accessibilityLabel="Rate per 8 hours"
                  keyboardType="numeric"
                  label="Rate per 8 hours"
                  onChangeText={setRateInput}
                  value={rateInput}
                />

                <View style={styles.ratingSection}>
                  <AppText variant="labelStrong">Rating</AppText>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Pressable
                        accessibilityLabel={`Rating ${value}`}
                        accessibilityRole="button"
                        key={value}
                        onPress={() => {
                          void selectionFeedback();
                          setRating(value);
                        }}
                        style={({ pressed }) => [
                          styles.ratingButton,
                          { opacity: pressed ? 0.72 : 1 },
                        ]}
                      >
                        <Ionicons
                          color={
                            (rating ?? 0) >= value
                              ? '#F5B321'
                              : theme.colors.borderStrong
                          }
                          name="star"
                          size={24}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.estimateBox,
                    {
                      backgroundColor: theme.colors.primarySoft,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <AppText color="textSecondary" variant="captionStrong">
                    Estimated amount
                  </AppText>
                  <AppText variant="numericLarge">
                    {formatPkrAmount(estimate)}
                  </AppText>
                </View>
              </>
            ) : null}

            <AppInput
              accessibilityLabel="Remarks"
              label="Remarks"
              multiline
              onChangeText={setRemarks}
              value={remarks}
            />

            {error ? (
              <AppText style={{ color: theme.colors.danger }} variant="caption">
                {error}
              </AppText>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Reset labour attendance draft"
                accessibilityRole="button"
                onPress={() => {
                  onReset();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.74 : 1,
                  },
                ]}
              >
                <AppText variant="labelStrong">Reset</AppText>
              </Pressable>
              <Pressable
                accessibilityLabel="Apply labour attendance details"
                accessibilityRole="button"
                onPress={() => {
                  if (
                    hours < 0 ||
                    hours > 24 ||
                    overtimeHours < 0 ||
                    overtimeHours > 24 ||
                    rate < 0 ||
                    (rating !== null && (rating < 1 || rating > 5))
                  ) {
                    setError('Working details are outside the allowed range.');
                    return;
                  }

                  onApply({
                    hours: status === 'present' ? hours : 0,
                    overtimeHours: status === 'present' ? overtimeHours : 0,
                    rate: status === 'present' ? rate : 0,
                    rating: status === 'present' ? rating : null,
                    remarks,
                  });
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.primaryAction,
                  {
                    backgroundColor: pressed
                      ? theme.colors.primaryPressed
                      : theme.colors.primary,
                  },
                ]}
              >
                <AppText style={{ color: '#FFFFFF' }} variant="labelStrong">
                  Apply
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type ModeButtonProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

function ModeButton({ label, onPress, selected }: ModeButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        {
          backgroundColor: selected
            ? theme.colors.primarySoft
            : theme.colors.surfaceMuted,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <AppText
        color={selected ? 'primary' : 'textSecondary'}
        variant="labelStrong"
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  estimateBox: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  ratingButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ratingSection: {
    gap: 10,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  sheetContent: {
    gap: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    flex: 1,
    gap: 4,
  },
});
