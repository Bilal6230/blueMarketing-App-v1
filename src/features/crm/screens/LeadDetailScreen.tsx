import { useState } from 'react';
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
import { leadDetailMock } from '@/mocks/crm';
import { lightImpactFeedback } from '@/services/haptics';

export function LeadDetailScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Screen testID="lead-detail-screen">
      <AppHeader leftAction={<BackButton />} title="Lead detail" />
      {notice ? (
        <InlineMessage
          message={notice}
          title="Preview notice"
          tone="information"
        />
      ) : null}

      <AppCard surface="elevated">
        <View style={styles.hero}>
          <Avatar initials={leadDetailMock.initials} size={64} />
          <AppText align="center" variant="headingLarge">
            {leadDetailMock.name}
          </AppText>
          <StatusBadge label={leadDetailMock.status} variant="active" />
          <View style={styles.actionRow}>
            <AppButton
              fullWidth={false}
              onPress={async () => {
                await lightImpactFeedback();
                setNotice(
                  'Calling is not connected in this prototype. No phone action was started.',
                );
              }}
              title="Call lead"
              variant="primary"
            />
            <AppButton
              fullWidth={false}
              onPress={async () => {
                await lightImpactFeedback();
                setNotice(
                  'Add follow-up is a preview-only action in this sprint.',
                );
              }}
              title="Add follow-up"
              variant="secondary"
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title="Identity" />
        <AppText variant="labelStrong">{leadDetailMock.name}</AppText>
        <ProjectPill label={leadDetailMock.project} />
      </AppCard>

      <AppCard>
        <SectionHeader title="Contact" />
        <AppText variant="bodyStrong">{leadDetailMock.maskedPhone}</AppText>
        <AppText color="textSecondary" variant="body">
          {leadDetailMock.email}
        </AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title="Follow-up" />
        <AppText variant="bodyStrong">{leadDetailMock.followUp}</AppText>
        <AppText color="textSecondary" variant="caption">
          Preview scheduling only
        </AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title="Assignment" />
        <AppText variant="bodyStrong">{leadDetailMock.assignedTo}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader
          actionLabel="Edit"
          onPressAction={async () => {
            await lightImpactFeedback();
            setNotice(
              'Editing this lead is not connected yet. The timeline is read-only in this preview.',
            );
          }}
          title="Activity timeline"
        />
        {leadDetailMock.timeline.map((item) => (
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
