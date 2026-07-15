import { View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppText,
  Avatar,
  ProjectPill,
  Screen,
  SectionHeader,
  StatusBadge,
  TimelineItem,
} from '@/components';
import { leadDetailMock } from '@/mocks/crm';
import { lightImpactFeedback } from '@/services/haptics';

export function LeadDetailScreen() {
  return (
    <Screen>
      <AppCard surface="elevated">
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Avatar initials={leadDetailMock.initials} size={64} />
          <AppText align="center" variant="headingLarge">
            {leadDetailMock.name}
          </AppText>
          <StatusBadge label={leadDetailMock.status} variant="active" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <AppButton
              fullWidth={false}
              onPress={async () => {
                await lightImpactFeedback();
              }}
              title="Call lead"
              variant="primary"
            />
            <AppButton
              fullWidth={false}
              onPress={async () => {
                await lightImpactFeedback();
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
        <SectionHeader actionLabel="Edit" title="Activity timeline" />
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
