import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppText,
  Avatar,
  BackButton,
  EmptyState,
  InlineMessage,
  Screen,
} from '@/components';
import { ApiError } from '@/api/errors';
import { UpdateFollowUpSheet } from '@/features/crm/components/UpdateFollowUpSheet';
import { mapCrmFieldErrors } from '@/features/crm/services/crmService';
import { useCrmStore } from '@/features/crm/store/crmStore';
import { hasCrmPermission } from '@/features/crm/utils/crmPermissions';
import {
  formatHistoryDuration,
  formatInfoDateTime,
  formatLeadFollowUpLabel,
  getFollowUpTiming,
  getHistoryStatusLabel,
  getLeadFullName,
  getLeadInitials,
  getRecordStateLabel,
} from '@/features/crm/utils/crmSelectors';
import { useAuthStore } from '@/store/authStore';

function toDateInput(value: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function toTimeInput(value: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(11, 16);
}

function combineDateAndTime(date: string, time: string) {
  const trimmedDate = date.trim();
  const trimmedTime = time.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(trimmedTime)) {
    return null;
  }

  return `${trimmedDate} ${trimmedTime}:00`;
}

export function LeadDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ leadId?: string; notice?: string }>();
  const backendRoleNames = useAuthStore((state) => state.backendRoleNames);
  const permissions = useAuthStore((state) => state.permissions);
  const canUpdateLead = hasCrmPermission(
    permissions,
    backendRoleNames,
    'update lead',
  );
  const leadId = Number(params.leadId ?? 0);
  const loadLeadDetail = useCrmStore((state) => state.loadLeadDetail);
  const loadLeadHistory = useCrmStore((state) => state.loadLeadHistory);
  const detailById = useCrmStore((state) => state.detailById);
  const historyByLeadId = useCrmStore((state) => state.historyByLeadId);
  const historyErrorByLeadId = useCrmStore((state) => state.historyErrorByLeadId);
  const isLoadingLead = useCrmStore((state) => state.isLoadingLead);
  const isMutating = useCrmStore((state) => state.isMutating);
  const leadError = useCrmStore((state) => state.leadError);
  const updateLeadFollowUp = useCrmStore((state) => state.updateLeadFollowUp);
  const lead = detailById[leadId] ?? null;
  const history = historyByLeadId[leadId] ?? [];
  const historyError = historyErrorByLeadId[leadId] ?? null;
  const [notice, setNotice] = useState<string | null>(
    typeof params.notice === 'string' ? params.notice : null,
  );
  const [followUpVisible, setFollowUpVisible] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ followUpDate?: string; followUpTime?: string }>({});

  useEffect(() => {
    if (!leadId) {
      return;
    }

    void loadLeadDetail(leadId);
    void loadLeadHistory(leadId);
  }, [leadId, loadLeadDetail, loadLeadHistory]);

  const followUpTiming = useMemo(
    () => getFollowUpTiming(lead?.followUp ?? null),
    [lead?.followUp],
  );

  if (!leadId) {
    return (
      <Screen testID="lead-detail-screen">
        <AppHeader leftAction={<BackButton />} title="Lead detail" />
        <EmptyState subtitle="Select a lead from CRM to continue." title="Lead unavailable" />
      </Screen>
    );
  }

  if (isLoadingLead && !lead) {
    return (
      <Screen testID="lead-detail-screen">
        <AppHeader leftAction={<BackButton />} title="Lead detail" />
      </Screen>
    );
  }

  if (!lead) {
    return (
      <Screen testID="lead-detail-screen">
        <AppHeader leftAction={<BackButton />} title="Lead detail" />
        {leadError?.statusCode === 403 ? (
          <EmptyState
            subtitle="CRM access is not available for this account."
            title="CRM unavailable"
          />
        ) : leadError?.statusCode === 404 ? (
          <EmptyState subtitle="This lead could not be found." title="Lead unavailable" />
        ) : (
          <EmptyState
            actionLabel="Try again"
            onPressAction={() => {
              void loadLeadDetail(leadId);
              void loadLeadHistory(leadId);
            }}
            subtitle="Unable to load CRM right now. Try again."
            title="CRM unavailable"
          />
        )}
      </Screen>
    );
  }

  const fullName = getLeadFullName(lead.firstName, lead.lastName);

  return (
    <Screen testID="lead-detail-screen">
      <AppHeader
        leftAction={<BackButton />}
        rightAction={
          canUpdateLead ? (
            <Pressable
              accessibilityLabel="Edit lead"
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  params: { leadId: String(lead.id) },
                  pathname: '/(app)/lead-edit',
                })
              }
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <AppText color="primary" variant="labelStrong">
                Edit
              </AppText>
            </Pressable>
          ) : undefined
        }
        title="Lead detail"
      />

      {notice ? (
        <InlineMessage message={notice} title="CRM" tone="information" />
      ) : null}
      {historyError ? (
        <InlineMessage
          message="Unable to load follow-up history right now."
          title="CRM"
          tone="warning"
        />
      ) : null}

      <AppCard style={styles.identityPanel} surface="elevated">
        <Avatar initials={getLeadInitials(lead.firstName, lead.lastName)} size={52} />
        <View style={styles.identityCopy}>
          <AppText numberOfLines={1} variant="headingSmall">
            {fullName}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="body">
            {lead.project.name ?? 'Project unavailable'}
          </AppText>
          <View style={styles.identityMeta}>
            <MetaPill label={getRecordStateLabel(lead.recordState)} tone="neutral" />
            <MetaPill
              label={formatLeadFollowUpLabel(lead.followUp)}
              tone={
                followUpTiming === 'overdue'
                  ? 'danger'
                  : followUpTiming === 'today'
                    ? 'warning'
                    : followUpTiming === 'upcoming'
                      ? 'primary'
                      : 'neutral'
              }
            />
          </View>
        </View>
      </AppCard>

      <View style={styles.actionRow}>
        <AppButton
          disabled={!lead.phoneNumber}
          fullWidth={false}
          leadingIcon="call-outline"
          onPress={async () => {
            const url = `tel:${lead.phoneNumber}`;
            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
              setNotice('Unable to start the phone call.');
              return;
            }

            await Linking.openURL(url);
          }}
          title="Call"
        />
        {canUpdateLead ? (
          <AppButton
            fullWidth={false}
            leadingIcon="time-outline"
            onPress={() => {
              setFollowUpDate(toDateInput(lead.followUp));
              setFollowUpTime(toTimeInput(lead.followUp));
              setRemarks('');
              setSelectedStatus(null);
              setErrors({});
              setFollowUpVisible(true);
            }}
            title="Update follow-up"
            variant="secondary"
          />
        ) : null}
      </View>

      <AppCard style={styles.sectionCard} surface="elevated">
        <InfoRow
          icon="call-outline"
          label="Primary phone"
          onPress={async () => {
            const url = `tel:${lead.phoneNumber}`;
            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
              setNotice('Unable to start the phone call.');
              return;
            }

            await Linking.openURL(url);
          }}
          value={lead.phoneNumber}
        />
        {lead.mobileNumber ? (
          <InfoRow
            icon="phone-portrait-outline"
            label="Secondary phone"
            onPress={async () => {
              const url = `tel:${lead.mobileNumber}`;
              const canOpen = await Linking.canOpenURL(url);

              if (!canOpen) {
                setNotice('Unable to start the phone call.');
                return;
              }

              await Linking.openURL(url);
            }}
            value={lead.mobileNumber}
          />
        ) : null}
        {lead.nicNumberMasked ? (
          <InfoRow icon="card-outline" label="Masked NIC" value={lead.nicNumberMasked} />
        ) : null}
        {lead.followUp ? (
          <InfoRow
            icon="calendar-outline"
            label="Next follow-up"
            value={formatInfoDateTime(lead.followUp) ?? lead.followUp}
          />
        ) : null}
        {lead.assignedUser ? (
          <InfoRow icon="person-outline" label="Assigned to" value={lead.assignedUser.name} />
        ) : null}
        {lead.createdAt ? (
          <InfoRow
            icon="time-outline"
            label="Created"
            value={formatInfoDateTime(lead.createdAt) ?? lead.createdAt}
          />
        ) : null}
        {lead.updatedAt ? (
          <InfoRow
            icon="refresh-outline"
            label="Last updated"
            value={formatInfoDateTime(lead.updatedAt) ?? lead.updatedAt}
          />
        ) : null}
      </AppCard>

      {lead.latestRemarks ? (
        <AppCard style={styles.sectionCard} surface="elevated">
          <AppText variant="title">Latest remarks</AppText>
          <AppText color="textSecondary" variant="body">
            {lead.latestRemarks}
          </AppText>
        </AppCard>
      ) : null}

      <AppCard style={styles.sectionCard} surface="elevated">
        <AppText variant="title">History</AppText>
        {history.length === 0 ? (
          <AppText color="textSecondary" variant="body">
            No follow-up history yet.
          </AppText>
        ) : (
          history.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.historyItem,
                index < history.length - 1 ? styles.historyItemBorder : null,
              ]}
            >
              <View style={styles.timelineDot} />
              <View style={styles.historyCopy}>
                <AppText variant="labelStrong">
                  {getHistoryStatusLabel(item.callStatus)}
                </AppText>
                {item.comment ? (
                  <AppText color="textSecondary" variant="body">
                    {item.comment}
                  </AppText>
                ) : null}
                <View style={styles.historyMeta}>
                  {item.followUp ? (
                    <AppText color="textSecondary" variant="caption">
                      {`Follow-up \u00B7 ${formatInfoDateTime(item.followUp) ?? item.followUp}`}
                    </AppText>
                  ) : null}
                  {item.callDuration ? (
                    <AppText color="textSecondary" variant="caption">
                      {`Duration \u00B7 ${formatHistoryDuration(item.callDuration)}`}
                    </AppText>
                  ) : null}
                  {item.user || item.createdAt ? (
                    <AppText color="textSecondary" variant="caption">
                      {`${item.user?.name ?? 'Unknown'} \u00B7 ${formatInfoDateTime(item.createdAt) ?? item.createdAt ?? ''}`}
                    </AppText>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        )}
      </AppCard>

      <UpdateFollowUpSheet
        errors={errors}
        followUpDate={followUpDate}
        followUpTime={followUpTime}
        remarks={remarks}
        saving={isMutating}
        selectedStatus={selectedStatus as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null}
        visible={followUpVisible}
        onChangeDate={setFollowUpDate}
        onChangeRemarks={setRemarks}
        onChangeStatus={(value) => setSelectedStatus(value)}
        onChangeTime={setFollowUpTime}
        onClose={() => {
          setErrors({});
          setFollowUpVisible(false);
        }}
        onSave={async () => {
          const nextErrors: { followUpDate?: string; followUpTime?: string } = {};

          if (!followUpDate.trim()) {
            nextErrors.followUpDate = 'Follow-up date is required.';
          }

          if (!followUpTime.trim()) {
            nextErrors.followUpTime = 'Time is required.';
          }

          const followUpDateTime = combineDateAndTime(followUpDate, followUpTime);

          if (!followUpDateTime) {
            nextErrors.followUpTime = 'Use a valid date and time.';
          }

          setErrors(nextErrors);

          if (Object.keys(nextErrors).length > 0 || !followUpDateTime) {
            return;
          }

          try {
            await updateLeadFollowUp(lead.id, {
              followUpDate: followUpDateTime,
              remarks: remarks.trim() || null,
              status: selectedStatus as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null,
            });

            setFollowUpVisible(false);
            setRemarks('');
            setErrors({});
            setNotice('Follow-up updated.');
          } catch (error) {
            if (error instanceof ApiError && error.statusCode === 422) {
              const fieldErrors = mapCrmFieldErrors(error.fieldErrors);
              setErrors({
                followUpDate: fieldErrors.followUp,
                followUpTime: fieldErrors.followUp,
              });
              return;
            }

            setNotice('Unable to update the follow-up.');
          }
        }}
      />
    </Screen>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void | Promise<void>;
  value: string;
};

function InfoRow({ icon, label, onPress, value }: InfoRowProps) {
  const content = (
    <View style={styles.infoRow}>
      <View style={styles.infoLead}>
        <Ionicons color="#526276" name={icon} size={18} />
        <AppText color="textSecondary" variant="caption">
          {label}
        </AppText>
      </View>
      <AppText align="right" style={styles.infoValue} variant="bodyStrong">
        {value}
      </AppText>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={`${label} ${value}`}
      accessibilityRole="button"
      onPress={() => void onPress()}
      style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

type MetaPillProps = {
  label: string;
  tone: 'danger' | 'neutral' | 'primary' | 'warning';
};

function MetaPill({ label, tone }: MetaPillProps) {
  const backgroundColor =
    tone === 'danger'
      ? '#FDECEF'
      : tone === 'warning'
        ? '#FFF3DE'
        : tone === 'primary'
          ? '#EEF5FF'
          : '#EDF2F8';
  const textColor =
    tone === 'danger'
      ? '#C43D4B'
      : tone === 'warning'
        ? '#9A5B0F'
        : tone === 'primary'
          ? '#2878F0'
          : '#526276';

  return (
    <View style={[styles.metaPill, { backgroundColor }]}>
      <AppText style={{ color: textColor }} variant="captionStrong">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  historyCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  historyItemBorder: {
    borderBottomColor: '#D7E0EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyMeta: {
    gap: 4,
  },
  identityCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  identityMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  identityPanel: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoLead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionCard: {
    gap: 12,
  },
  timelineDot: {
    backgroundColor: '#2878F0',
    borderRadius: 999,
    height: 10,
    marginTop: 6,
    width: 10,
  },
});
