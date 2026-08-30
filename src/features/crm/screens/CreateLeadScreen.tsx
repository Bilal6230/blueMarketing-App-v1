import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppInput,
  AppText,
  InlineMessage,
  ProjectPill,
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
    if (globalThis.confirm('Discard the current lead draft?')) {
      onConfirm();
    }
    return;
  }

  Alert.alert('Discard changes?', 'Your entered lead details will be lost.', [
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

export function CreateLeadScreen() {
  const router = useRouter();
  const backendRoleNames = useAuthStore((state) => state.backendRoleNames);
  const permissions = useAuthStore((state) => state.permissions);
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const createLeadRecord = useCrmStore((state) => state.createLeadRecord);
  const isMutating = useCrmStore((state) => state.isMutating);
  const project = useMemo(
    () =>
      projects.find((item) => item.id === selectedProjectId) ??
      (projects.length === 1 ? projects[0] : null) ??
      null,
    [projects, selectedProjectId],
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<CrmFormErrors>({});
  const canCreateLead = hasCrmPermission(
    permissions,
    backendRoleNames,
    'create lead',
  );
  const isDirty = Boolean(
    firstName || lastName || phoneNumber || mobileNumber || nicNumber || followUpDate || followUpTime || remarks,
  );

  if (!canCreateLead) {
    return (
      <Screen testID="lead-create-screen">
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
          title="Create lead"
        />
        <InlineMessage
          message="You do not have permission to create a lead."
          title="CRM"
          tone="warning"
        />
      </Screen>
    );
  }

  return (
    <Screen testID="lead-create-screen">
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
        title="Create lead"
      />

      {notice ? (
        <InlineMessage message={notice} title="CRM" tone="warning" />
      ) : null}
      {!project ? (
        <InlineMessage
          message="Select a project before creating a lead."
          title="CRM"
          tone="warning"
        />
      ) : null}

      <AppCard surface="elevated">
        <View style={styles.formHeader}>
          <AppText variant="title">Selected project</AppText>
          {project ? <ProjectPill label={project.name} /> : null}
        </View>

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
          label="Initial follow-up date"
          onChangeText={setFollowUpDate}
          value={followUpDate}
        />
        <AppInput
          errorText={errors.followUp}
          helperText="Optional, HH:MM"
          label="Initial follow-up time"
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

              if (Object.keys(nextErrors).length > 0 || !project) {
                return;
              }

              try {
                const createdLead = await createLeadRecord({
                  firstName,
                  followUp,
                  lastName,
                  mobileNumber: mobileNumber || null,
                  nicNumber: nicNumber || null,
                  phoneNumber,
                  projectId: project.id,
                  remarks: remarks || null,
                });

                router.replace({
                  params: { leadId: String(createdLead.id), notice: 'Lead created.' },
                  pathname: '/(app)/lead-detail',
                });
              } catch (error) {
                if (error instanceof ApiError && error.statusCode === 422) {
                  setErrors(mapCrmFieldErrors(error.fieldErrors));
                  return;
                }

                setNotice('Unable to create the lead.');
              }
            }}
            title="Create lead"
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
  formHeader: {
    gap: 8,
  },
});
