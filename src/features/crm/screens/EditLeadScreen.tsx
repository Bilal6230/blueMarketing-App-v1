import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppInput,
  InlineMessage,
  Screen,
} from '@/components';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { hasCrmPermission } from '@/features/crm/utils/crmPermissions';
import { useAuthStore } from '@/store/authStore';

function confirmDiscard(isDirty: boolean, onConfirm: () => void) {
  if (!isDirty) {
    onConfirm();
    return;
  }

  if (Platform.OS === 'web') {
    if (globalThis.confirm('Discard the current lead changes?')) {
      onConfirm();
    }
    return;
  }

  Alert.alert('Discard changes?', 'Your lead changes will be lost.', [
    { style: 'cancel', text: 'Keep editing' },
    { onPress: onConfirm, style: 'destructive', text: 'Discard' },
  ]);
}

function combineDateAndTime(date: string, time: string) {
  if (!date && !time) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || !/^\d{2}:\d{2}$/.test(time.trim())) {
    return null;
  }

  return `${date.trim()} ${time.trim()}:00`;
}

export function EditLeadScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const leadId = Number(params.leadId ?? 0);
  const canUpdateLead = hasCrmPermission(permissions, 'update lead');
  const loadLeadDetail = useCrmStore((state) => state.loadLeadDetail);
  const detailById = useCrmStore((state) => state.detailById);
  const updateLeadRecord = useCrmStore((state) => state.updateLeadRecord);
  const isMutating = useCrmStore((state) => state.isMutating);
  const lead = detailById[leadId] ?? null;
  const [notice, setNotice] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leadId) {
      void loadLeadDetail(leadId);
    }
  }, [leadId, loadLeadDetail]);

  useEffect(() => {
    if (!lead) {
      return;
    }

    setFirstName(lead.firstName);
    setLastName(lead.lastName);
    setPhoneNumber(lead.phoneNumber);
    setMobileNumber(lead.mobileNumber ?? '');
    setNicNumber('');
    setFollowUpDate(lead.followUp?.slice(0, 10) ?? '');
    setFollowUpTime(lead.followUp?.slice(11, 16) ?? '');
    setRemarks(lead.latestRemarks ?? '');
  }, [lead]);

  const isDirty = useMemo(
    () =>
      Boolean(
        firstName !== (lead?.firstName ?? '') ||
          lastName !== (lead?.lastName ?? '') ||
          phoneNumber !== (lead?.phoneNumber ?? '') ||
          mobileNumber !== (lead?.mobileNumber ?? '') ||
          followUpDate !== (lead?.followUp?.slice(0, 10) ?? '') ||
          followUpTime !== (lead?.followUp?.slice(11, 16) ?? '') ||
          remarks !== (lead?.latestRemarks ?? '') ||
          nicNumber,
      ),
    [firstName, followUpDate, followUpTime, lastName, lead, mobileNumber, nicNumber, phoneNumber, remarks],
  );

  if (!canUpdateLead) {
    return (
      <Screen testID="lead-edit-screen">
        <AppHeader
          leftAction={
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
            >
              <Ionicons color="#102033" name="arrow-back-outline" size={24} />
            </Pressable>
          }
          title="Edit lead"
        />
        <InlineMessage
          message="You do not have permission to edit this lead."
          title="CRM"
          tone="warning"
        />
      </Screen>
    );
  }

  return (
    <Screen testID="lead-edit-screen">
      <AppHeader
        leftAction={
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => confirmDiscard(isDirty, () => router.back())}
          >
            <Ionicons color="#102033" name="arrow-back-outline" size={24} />
          </Pressable>
        }
        title="Edit lead"
      />

      {notice ? (
        <InlineMessage message={notice} title="CRM" tone="warning" />
      ) : null}

      <AppCard surface="elevated">
        <AppInput
          errorText={errors.firstName}
          label="First name"
          onChangeText={setFirstName}
          value={firstName}
        />
        <AppInput
          errorText={errors.lastName}
          label="Last name"
          onChangeText={setLastName}
          value={lastName}
        />
        <AppInput
          errorText={errors.phoneNumber}
          keyboardType="phone-pad"
          label="Primary phone"
          onChangeText={setPhoneNumber}
          value={phoneNumber}
        />
        <AppInput
          keyboardType="phone-pad"
          label="Secondary phone"
          onChangeText={setMobileNumber}
          value={mobileNumber}
        />
        <AppInput
          label="NIC"
          onChangeText={setNicNumber}
          value={nicNumber}
        />
        <AppInput
          helperText="Optional, YYYY-MM-DD"
          label="Follow-up date"
          onChangeText={setFollowUpDate}
          value={followUpDate}
        />
        <AppInput
          helperText="Optional, HH:MM"
          label="Follow-up time"
          onChangeText={setFollowUpTime}
          value={followUpTime}
        />
        <AppInput
          helperText="Optional"
          label="Remarks"
          multiline
          onChangeText={setRemarks}
          value={remarks}
        />

        <View style={styles.actions}>
          <AppButton
            fullWidth={false}
            onPress={() => confirmDiscard(isDirty, () => router.back())}
            title="Cancel"
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            loading={isMutating}
            onPress={async () => {
              const nextErrors: Record<string, string> = {};

              if (!firstName.trim()) {
                nextErrors.firstName = 'First name is required.';
              }

              if (!lastName.trim()) {
                nextErrors.lastName = 'Last name is required.';
              }

              if (!phoneNumber.trim()) {
                nextErrors.phoneNumber = 'Primary phone is required.';
              }

              const followUp = combineDateAndTime(followUpDate, followUpTime);

              if ((followUpDate || followUpTime) && !followUp) {
                nextErrors.followUpDate = 'Use a valid date and time.';
              }

              setErrors(nextErrors);

              if (Object.keys(nextErrors).length > 0 || !lead) {
                return;
              }

              const updatedLead = await updateLeadRecord(lead.id, {
                firstName,
                followUp,
                lastName,
                mobileNumber: mobileNumber || null,
                nicNumber: nicNumber || null,
                phoneNumber,
                remarks: remarks || null,
              });

              if (!updatedLead) {
                setNotice('Unable to update the lead.');
                return;
              }

              router.replace({
                params: { leadId: String(updatedLead.id), notice: 'Lead updated.' },
                pathname: '/(app)/lead-detail',
              });
            }}
            title="Save changes"
          />
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
