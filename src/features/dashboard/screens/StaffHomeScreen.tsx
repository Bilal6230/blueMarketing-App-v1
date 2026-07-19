import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  ActionTile,
  AppCard,
  AppHeader,
  AppTabScaffold,
  AppText,
  HeroMetricCard,
  ListItem,
  ProjectPill,
  SectionHeader,
} from '@/components';
import { dashboardFixtures } from '@/features/dashboard/data/dashboardFixtures';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { successFeedback } from '@/services/haptics';

export function StaffHomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      selectedKey="home"
      testID="staff-home-screen"
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppHeader
            leftAction={
              <ProjectPill label={dashboardFixtures.shared.projectName} />
            }
            subtitle={dashboardFixtures.shared.dateLabel}
            title={dashboardFixtures.staff.greeting}
          />
        </View>

        <HeroMetricCard
          caption="Attendance"
          progress={0.4}
          subtitle="2 follow-ups are due before noon"
          title="Check attendance and open CRM priorities"
        />

        <View style={styles.metrics}>
          {dashboardFixtures.staff.stats.map((metric) => (
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
          {dashboardFixtures.staff.priorities.map((item) => (
            <ActionTile
              hint="Priority for field operations today"
              icon="checkmark-done-outline"
              key={item}
              label={item}
              onPress={async () => {
                await successFeedback();
                router.push('/(app)/crm');
              }}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            actionLabel="Open CRM"
            onPressAction={() => router.push('/(app)/crm')}
            title="Recent lead activity"
          />
          {dashboardFixtures.staff.recentActivity.map((item) => (
            <ListItem
              icon="ellipse-outline"
              key={item}
              onPress={() => router.push('/(app)/crm')}
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
  section: {
    gap: 12,
  },
});
