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
import {
  mapCrmFieldErrors,
  type CrmFormErrors,
  type LeadDetailRecord,
  type UpdateLeadInput,
} from '@/features/crm/services/crmService';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { hasCrmPermission } from '@/features/crm/utils/crmPermissions';
import { useAuthStore } from '@/store/authStore';

export function confirmDiscard(isDirty: boolean, onConfirm: () => void) {
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

export function getInitialEditLeadFormValues(lead: LeadDetailRecord) {
  return {
    firstName: lead.firstName,
    followUpDate: lead.followUp?.slice(0, 10) ?? '',
    followUpTime: lead.followUp?.slice(11, 16) ?? '',
    lastName: lead.lastName,
    mobileNumber: lead.mobileNumber ?? '',
    nicNumber: '',
    phoneNumber: lead.phoneNumber,
    remarks: '',
  };
}

type EditLeadFormValues = ReturnType<typeof getInitialEditLeadFormValues>;

export function buildEditLeadInput(values: EditLeadFormValues): UpdateLeadInput {
  return {
    firstName: values.firstName,
    followUp: combineDateAndTime(values.followUpDate, values.followUpTime),
    lastName: values.lastName,
    mobileNumber: values.mobileNumber || null,
    nicNumber: values.nicNumber.trim() || undefined,
    phoneNumber: values.phoneNumber,
    remarks: values.remarks.trim() || undefined,
  };
}

export function EditLeadScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const router = useRouter();
  const backendRoleNames = useAuthStore((state) => state.backendRoleNames);
  const permissions = useAuthStore((state) => state.permissions);
  const leadId = Number(params.leadId ?? 0);
  const canUpdateLead = hasCrmPermission(
    permissions,
    backendRoleNames,
    'update lead',
  );
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
      <EditLeadForm
        key={lead.id}
        lead={lead}
        notice={notice}
        onCancel={() => router.back()}
        onError={(message) => setNotice(message)}
      />
    </Screen>
  );
}

type EditLeadFormProps = {
  lead: NonNullable<ReturnType<typeof useCrmStore.getState>['detailById'][number]>;
  notice: string | null;
  onCancel: () => void;
  onError: (message: string | null) => void;
};

function EditLeadForm({ lead, notice, onCancel, onError }: EditLeadFormProps) {
  const router = useRouter();
  const updateLeadRecord = useCrmStore((state) => state.updateLeadRecord);
  const isMutating = useCrmStore((state) => state.isMutating);
  const initialValues = getInitialEditLeadFormValues(lead);
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber);
  const [mobileNumber, setMobileNumber] = useState(initialValues.mobileNumber);
  const [nicNumber, setNicNumber] = useState(initialValues.nicNumber);
  const [followUpDate, setFollowUpDate] = useState(initialValues.followUpDate);
  const [followUpTime, setFollowUpTime] = useState(initialValues.followUpTime);
  const [remarks, setRemarks] = useState(initialValues.remarks);
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
          Boolean(remarks.trim()) ||
          nicNumber,
      ),
    [firstName, followUpDate, followUpTime, lastName, lead, mobileNumber, nicNumber, phoneNumber, remarks],
  );

  return (
    <>
      <AppHeader
        leftAction={
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => confirmDiscard(isDirty, onCancel)}
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
          helperText={
            lead.nicNumberMasked
              ? `Current NIC: ${lead.nicNumberMasked}. Enter a new NIC only to replace it.`
              : 'Optional'
          }
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
                const updatedLead = await updateLeadRecord(
                  lead.id,
                  buildEditLeadInput({
                    firstName,
                    followUpDate,
                    followUpTime,
                    lastName,
                    mobileNumber,
                    nicNumber,
                    phoneNumber,
                    remarks,
                  }),
                );

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
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
