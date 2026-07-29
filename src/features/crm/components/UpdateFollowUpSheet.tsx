import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/controls/AppButton';
import { AppInput } from '@/components/controls/AppInput';
import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { updateFollowUpStatusOptions } from '@/features/crm/data/crmMetadata';
import type { CrmCallStatusId } from '@/features/crm/data/crmMetadata';

type UpdateFollowUpSheetProps = {
  errors: {
    followUpDate?: string;
    followUpTime?: string;
  };
  followUpDate: string;
  followUpTime: string;
  remarks: string;
  saving: boolean;
  selectedStatus: CrmCallStatusId | null;
  visible: boolean;
  onChangeDate: (value: string) => void;
  onChangeRemarks: (value: string) => void;
  onChangeStatus: (value: CrmCallStatusId | null) => void;
  onChangeTime: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function UpdateFollowUpSheet({
  errors,
  followUpDate,
  followUpTime,
  remarks,
  saving,
  selectedStatus,
  visible,
  onChangeDate,
  onChangeRemarks,
  onChangeStatus,
  onChangeTime,
  onClose,
  onSave,
}: UpdateFollowUpSheetProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <AppCard padding="none" style={styles.sheet} surface="elevated">
          <View style={styles.content}>
            <View style={styles.header}>
              <AppText variant="headingMedium">Update follow-up</AppText>
              <AppText color="textSecondary" variant="caption">
                Record the next call and remarks
              </AppText>
            </View>

            <View style={styles.statusGrid}>
              {updateFollowUpStatusOptions.map((status) => {
                const selected = selectedStatus === status.id;

                return (
                  <Pressable
                    accessibilityLabel={status.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={status.id}
                    onPress={() => onChangeStatus(selected ? null : status.id)}
                    style={({ pressed }) => [
                      styles.statusOption,
                      selected ? styles.statusOptionSelected : null,
                      { opacity: pressed ? 0.86 : 1 },
                    ]}
                  >
                    <AppText
                      color={selected ? 'primary' : 'textPrimary'}
                      variant="labelStrong"
                    >
                      {status.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.datetimeRow}>
              <AppInput
                errorText={errors.followUpDate}
                helperText="YYYY-MM-DD"
                label="Follow-up date"
                onChangeText={onChangeDate}
                value={followUpDate}
              />
              <AppInput
                errorText={errors.followUpTime}
                helperText="HH:MM"
                label="Time"
                onChangeText={onChangeTime}
                value={followUpTime}
              />
            </View>

            <AppInput
              helperText="Optional"
              label="Remarks"
              multiline
              onChangeText={onChangeRemarks}
              value={remarks}
            />

            <View style={styles.actions}>
              <AppButton
                fullWidth={false}
                onPress={onClose}
                title="Cancel"
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                loading={saving}
                onPress={onSave}
                title="Save follow-up"
              />
            </View>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  content: {
    gap: 16,
    padding: 16,
  },
  datetimeRow: {
    gap: 12,
  },
  header: {
    gap: 4,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusOption: {
    alignItems: 'center',
    borderColor: '#D7E0EB',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
    minWidth: '47%',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statusOptionSelected: {
    backgroundColor: '#EEF5FF',
    borderColor: '#2878F0',
  },
});
