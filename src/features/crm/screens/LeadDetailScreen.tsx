import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppInput,
  AppText,
  Avatar,
  BackButton,
  InlineMessage,
  ProjectPill,
  Screen,
  SectionHeader,
  SegmentedControl,
  StatusBadge,
  TimelineItem,
} from '@/components';
import type { LeadStatus } from '@/features/crm/data/leadFixtures';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { parseIsoDateInput, toIsoDateInputValue } from '@/utils/dateTime';

const statusOptions: { label: string; value: LeadStatus }[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Overdue', value: 'Overdue' },
  { label: 'Pending', value: 'Pending' },
];

export function LeadDetailScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const addLeadFollowUp = useCrmStore((state) => state.addLeadFollowUp);
  const leads = useCrmStore((state) => state.leads);
  const updateLeadRecord = useCrmStore((state) => state.updateLeadRecord);
  const [notice, setNotice] = useState<string | null>(null);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpDateValue, setFollowUpDateValue] = useState(
    toIsoDateInputValue(new Date()),
  );
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LeadStatus>('Active');
  const [updatedFollowUpDate, setUpdatedFollowUpDate] = useState(
    toIsoDateInputValue(new Date()),
  );
  const lead = useMemo(
    () =>
      leads.find((item) => item.id === (params.leadId ?? '')) ??
      leads.find((item) => item.id === 'lead-1') ??
      null,
    [leads, params.leadId],
  );

  if (!lead) {
    return (
      <Screen testID="lead-detail-screen">
        <AppHeader leftAction={<BackButton />} title="Lead detail" />
        <InlineMessage
          message="Unable to complete this action."
          title="Lead detail"
          tone="warning"
        />
      </Screen>
    );
  }

  return (
    <Screen testID="lead-detail-screen">
      <AppHeader leftAction={<BackButton />} title="Lead detail" />
      {notice ? (
        <InlineMessage
          message={notice}
          title="Lead detail"
          tone="information"
        />
      ) : null}

      <AppCard surface="elevated">
        <View style={styles.hero}>
          <Avatar initials={lead.initials} size={64} />
          <AppText align="center" variant="headingLarge">
            {lead.name}
          </AppText>
          <StatusBadge label={lead.status} variant={lead.statusTone} />
          <View style={styles.actionRow}>
            <AppButton
              fullWidth={false}
              onPress={async () => {
                const callUrl = `tel:${lead.fullPhone}`;
                const canOpen = await Linking.canOpenURL(callUrl);

                if (!canOpen) {
                  setNotice('Unable to complete this action.');
                  return;
                }

                await Linking.openURL(callUrl);
              }}
              title="Call lead"
              variant="primary"
            />
            <AppButton
              fullWidth={false}
              onPress={() => setFollowUpModalVisible(true)}
              title="Log follow-up"
              variant="secondary"
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title="Identity" />
        <AppText variant="labelStrong">{lead.name}</AppText>
        <ProjectPill label={lead.project} />
      </AppCard>

      <AppCard>
        <SectionHeader title="Contact" />
        <AppText variant="bodyStrong">{lead.maskedPhone}</AppText>
        <AppText color="textSecondary" variant="body">
          {lead.email}
        </AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title="Follow-up" />
        <AppText variant="bodyStrong">{lead.followUp}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title="Assignment" />
        <AppText variant="bodyStrong">{lead.assignedTo}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader
          actionLabel="Update"
          onPressAction={() => {
            setAssignee(lead.assignedTo);
            setEmail(lead.email);
            setStatus(lead.status);
            setUpdatedFollowUpDate(
              parseIsoDateInput(lead.followUpDate)
                ? toIsoDateInputValue(new Date(lead.followUpDate))
                : toIsoDateInputValue(new Date()),
            );
            setUpdateModalVisible(true);
          }}
          title="Activity timeline"
        />
        {lead.timeline.map((item) => (
          <TimelineItem
            body={item.body}
            key={`${item.title}-${item.time}`}
            time={item.time}
            title={item.title}
          />
        ))}
      </AppCard>

      <Modal
        animationType="slide"
        onRequestClose={() => setFollowUpModalVisible(false)}
        transparent
        visible={followUpModalVisible}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setFollowUpModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <AppCard style={styles.modalCard} surface="elevated">
            <AppText variant="headingSmall">Add follow-up</AppText>
            <AppInput
              helperText="Enter the next action for this lead."
              label="Note"
              multiline
              onChangeText={setFollowUpNote}
              value={followUpNote}
            />
            <AppInput
              helperText="Use YYYY-MM-DD."
              label="Follow-up date"
              onChangeText={setFollowUpDateValue}
              value={followUpDateValue}
            />
            <View style={styles.modalActions}>
              <AppButton
                fullWidth={false}
                onPress={() => setFollowUpModalVisible(false)}
                title="Cancel"
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                onPress={() => {
                  const parsedDate = parseIsoDateInput(followUpDateValue);

                  if (!followUpNote.trim() || !parsedDate) {
                    setNotice('Unable to complete this action.');
                    return;
                  }

                  const saved = addLeadFollowUp(lead.id, {
                    note: followUpNote.trim(),
                    scheduledFor: parsedDate,
                  });

                  if (!saved) {
                    setNotice('Unable to complete this action.');
                    return;
                  }

                  setFollowUpModalVisible(false);
                  setFollowUpNote('');
                  setNotice('Follow-up added.');
                }}
                title="Save"
              />
            </View>
          </AppCard>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setUpdateModalVisible(false)}
        transparent
        visible={updateModalVisible}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setUpdateModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <AppCard style={styles.modalCard} surface="elevated">
            <AppText variant="headingSmall">Update lead</AppText>
            <SegmentedControl
              accessibilityLabel="Lead status"
              onChange={setStatus}
              options={statusOptions}
              value={status}
            />
            <AppInput
              label="Assignee"
              onChangeText={setAssignee}
              value={assignee}
            />
            <AppInput label="Email" onChangeText={setEmail} value={email} />
            <AppInput
              helperText="Use YYYY-MM-DD."
              label="Follow-up date"
              onChangeText={setUpdatedFollowUpDate}
              value={updatedFollowUpDate}
            />
            <View style={styles.modalActions}>
              <AppButton
                fullWidth={false}
                onPress={() => setUpdateModalVisible(false)}
                title="Cancel"
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                onPress={() => {
                  const parsedDate = parseIsoDateInput(updatedFollowUpDate);

                  if (!assignee.trim() || !email.trim() || !parsedDate) {
                    setNotice('Unable to complete this action.');
                    return;
                  }

                  const saved = updateLeadRecord(lead.id, {
                    assignedTo: assignee.trim(),
                    email: email.trim(),
                    followUpDate: parsedDate,
                    status,
                  });

                  if (!saved) {
                    setNotice('Unable to complete this action.');
                    return;
                  }

                  setUpdateModalVisible(false);
                  setNotice('Lead updated.');
                }}
                title="Save"
              />
            </View>
          </AppCard>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxWidth: 480,
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
