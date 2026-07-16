import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  ActionTile,
  AppCard,
  AppHeader,
  AppTabScaffold,
  AppText,
  HeroMetricCard,
  IconButton,
  InlineMessage,
  ListItem,
  NotificationDot,
  ProjectPill,
  SectionHeader,
} from '@/components';
import { staffPreviewNavigation } from '@/features/preview/navigationModel';
import { useAppTheme } from '@/hooks/useAppTheme';
import { staffDashboardMock } from '@/mocks/dashboard';
import { previewUsers } from '@/mocks/user';
import { successFeedback, warningFeedback } from '@/services/haptics';

export function StaffHomeScreen() {
  const { theme } = useAppTheme();
  const [notice, setNotice] = useState<string | null>(null);

  const navigation = staffPreviewNavigation.map((item) =>
    item.href
      ? item
      : {
          ...item,
          onPress: async () => {
            await warningFeedback();
            setNotice(`${item.label} is coming in a later sprint.`);
          },
        },
  );

  return (
    <AppTabScaffold
      items={navigation}
      selectedKey="home"
      testID="staff-home-screen"
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppHeader
            leftAction={
              <ProjectPill
                label={previewUsers.staff.project}
                onPress={async () => {
                  await warningFeedback();
                  setNotice(
                    'Project switching is a preview-only entry point in this sprint.',
                  );
                }}
              />
            }
            rightAction={
              <View style={styles.notificationWrap}>
                <IconButton
                  accessibilityHint="Shows a preview-only notification message"
                  accessibilityLabel="Notifications"
                  icon="notifications-outline"
                  onPress={async () => {
                    await warningFeedback();
                    setNotice(
                      'Notifications are not connected yet. This is a preview notice only.',
                    );
                  }}
                  testID="staff-notifications-button"
                />
                <View style={styles.notificationDot}>
                  <NotificationDot />
                </View>
              </View>
            }
            subtitle="Current project"
            title={staffDashboardMock.greeting}
          />
          {notice ? (
            <InlineMessage
              message={notice}
              title="Preview route unavailable"
              tone="warning"
            />
          ) : null}
        </View>

        <HeroMetricCard
          caption="Attendance"
          progress={0.4}
          subtitle="Not checked in"
          title="Check in now"
        />

        <View style={styles.metrics}>
          {staffDashboardMock.stats.map((metric) => (
            <AppCard key={metric.label} surface="elevated">
              <Ionicons
                accessibilityElementsHidden
                color={theme.colors.primary}
                name={metric.icon as keyof typeof Ionicons.glyphMap}
                size={18}
              />
              <AppText color="textSecondary" variant="caption">
                {metric.label}
              </AppText>
              <AppText variant="numericLarge">{metric.value}</AppText>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Today's priorities" />
          {staffDashboardMock.priorities.map((item) => (
            <ActionTile
              hint="Priority for field operations today"
              icon="checkmark-done-outline"
              key={item}
              label={item}
              onPress={async () => {
                await successFeedback();
                setNotice(
                  `${item} is a preview-only task card in this sprint.`,
                );
              }}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            actionLabel="Add lead"
            onPressAction={async () => {
              await warningFeedback();
              setNotice(
                'Add lead is not connected yet. No CRM mutation is performed.',
              );
            }}
            title="Recent lead activity"
          />
          {staffDashboardMock.recentActivity.map((item) => (
            <ListItem
              icon="ellipse-outline"
              key={item}
              onPress={async () => {
                await successFeedback();
                setNotice(
                  'Lead activity rows are preview summaries in this sprint.',
                );
              }}
              subtitle={item}
              title="Lead activity"
            />
          ))}
        </View>
      </View>
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  headerSection: {
    gap: 16,
  },
  metrics: {
    gap: 12,
  },
  notificationDot: {
    position: 'absolute',
    right: -2,
    top: -2,
  },
  notificationWrap: {
    position: 'relative',
  },
  section: {
    gap: 12,
  },
});
