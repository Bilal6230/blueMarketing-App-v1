import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppText,
  Avatar,
  BackButton,
  InlineMessage,
  ProjectPill,
  Screen,
  SectionHeader,
  StatusBadge,
  TimelineItem,
} from '@/components';
import { leadFixtures } from '@/features/crm/data/leadFixtures';
import { lightImpactFeedback } from '@/services/haptics';

export function LeadDetailScreen() {
  const params = useLocalSearchParams<{ leadId?: string }>();
  const [notice, setNotice] = useState<string | null>(null);
  const [timelineNotice, setTimelineNotice] = useState<string | null>(null);
  const lead = useMemo(
    () =>
      leadFixtures.find((item) => item.id === params.leadId) ??
      leadFixtures[0] ??
      null,
    [params.leadId],
  );

  if (!lead) {
    return (
      <Screen testID="lead-detail-screen">
        <AppHeader leftAction={<BackButton />} title="Lead detail" />
        <InlineMessage
          message="The selected lead could not be loaded."
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
              disabled
              fullWidth={false}
              title="Call lead"
              variant="primary"
            />
            <AppButton
              fullWidth={false}
              onPress={async () => {
                await lightImpactFeedback();
                setTimelineNotice(
                  'A local follow-up note was added to today’s review queue.',
                );
              }}
              title="Log follow-up"
              variant="secondary"
            />
          </View>
          <AppText align="center" color="textSecondary" variant="caption">
            Calling will be enabled after telephony permissions are configured.
          </AppText>
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
        {timelineNotice ? (
          <AppText color="textSecondary" variant="caption">
            {timelineNotice}
          </AppText>
        ) : null}
      </AppCard>

      <AppCard>
        <SectionHeader title="Assignment" />
        <AppText variant="bodyStrong">{lead.assignedTo}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader
          actionLabel="Update"
          onPressAction={async () => {
            await lightImpactFeedback();
            setNotice('Lead updates remain read-only in this frontend build.');
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
});
