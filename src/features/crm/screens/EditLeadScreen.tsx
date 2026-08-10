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
import { ApiError } from '@/api/errors';
import { mapCrmFieldErrors, type CrmFormErrors } from '@/features/crm/services/crmService';
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
  const leadError = useCrmStore((state) => state.leadError);
  const isLoadingLead = useCrmStore((state) => state.isLoadingLead);
  const lead = detailById[leadId] ?? null;
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (leadId) {
      void loadLeadDetail(leadId);
    }
  }, [leadId, loadLeadDetail]);

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

  if (isLoadingLead && !lead) {
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
      </Screen>
    );
  }

  if (!lead) {
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
          message={
            leadError?.statusCode === 404
              ? 'This lead could not be found.'
              : 'Unable to load CRM right now. Try again.'
          }
          title={leadError?.statusCode === 404 ? 'Lead unavailable' : 'CRM'}
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
            onPress={() => router.back()}
          >
            <Ionicons color="#102033" name="arrow-back-outline" size={24} />
          </Pressable>
        }
        title="Edit lead"
      />

      {notice ? (
        <InlineMessage message={notice} title="CRM" tone="warning" />
      ) : null}

      <EditLeadForm
        key={lead.id}
        lead={lead}
        onCancel={() => router.back()}
        onError={(message) => setNotice(message)}
      />
    </Screen>
  );
}

type EditLeadFormProps = {
  lead: NonNullable<ReturnType<typeof useCrmStore.getState>['detailById'][number]>;
  onCancel: () => void;
  onError: (message: string | null) => void;
};

function EditLeadForm({ lead, onCancel, onError }: EditLeadFormProps) {
  const router = useRouter();
  const updateLeadRecord = useCrmStore((state) => state.updateLeadRecord);
  const isMutating = useCrmStore((state) => state.isMutating);
  const [firstName, setFirstName] = useState(lead.firstName);
  const [lastName, setLastName] = useState(lead.lastName);
  const [phoneNumber, setPhoneNumber] = useState(lead.phoneNumber);
  const [mobileNumber, setMobileNumber] = useState(lead.mobileNumber ?? '');
  const [nicNumber, setNicNumber] = useState('');
  const [followUpDate, setFollowUpDate] = useState(lead.followUp?.slice(0, 10) ?? '');
  const [followUpTime, setFollowUpTime] = useState(lead.followUp?.slice(11, 16) ?? '');
  const [remarks, setRemarks] = useState(lead.latestRemarks ?? '');
  const [errors, setErrors] = useState<CrmFormErrors>({});
  const isDirty = useMemo(
    () =>
      Boolean(
        firstName !== lead.firstName ||
          lastName !== lead.lastName ||
          phoneNumber !== lead.phoneNumber ||
          mobileNumber !== (lead.mobileNumber ?? '') ||
          followUpDate !== (lead.followUp?.slice(0, 10) ?? '') ||
          followUpTime !== (lead.followUp?.slice(11, 16) ?? '') ||
          remarks !== (lead.latestRemarks ?? '') ||
          nicNumber,
      ),
    [firstName, followUpDate, followUpTime, lastName, lead, mobileNumber, nicNumber, phoneNumber, remarks],
  );

  return (
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
        errorText={errors.followUp}
        helperText="Optional, YYYY-MM-DD"
        label="Follow-up date"
        onChangeText={setFollowUpDate}
        value={followUpDate}
      />
      <AppInput
        errorText={errors.followUp}
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
          onPress={() => confirmDiscard(isDirty, onCancel)}
          title="Cancel"
          variant="secondary"
        />
        <AppButton
          fullWidth={false}
          loading={isMutating}
          onPress={async () => {
            const nextErrors: CrmFormErrors = {};

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
              nextErrors.followUp = 'Use a valid date and time.';
            }

            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
              return;
            }

            try {
              const updatedLead = await updateLeadRecord(lead.id, {
                firstName,
                followUp,
                lastName,
                mobileNumber: mobileNumber || null,
                nicNumber: nicNumber || null,
                phoneNumber,
                remarks: remarks || null,
              });

              router.replace({
                params: { leadId: String(updatedLead.id), notice: 'Lead updated.' },
                pathname: '/(app)/lead-detail',
              });
            } catch (error) {
              if (error instanceof ApiError && error.statusCode === 422) {
                setErrors(mapCrmFieldErrors(error.fieldErrors));
                return;
              }

              onError('Unable to update the lead.');
            }
          }}
          title="Save changes"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
