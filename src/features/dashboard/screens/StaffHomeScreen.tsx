import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  ActionTile,
  AppCard,
  AppTabScaffold,
  AppText,
  DashboardHeader,
  HeroMetricCard,
  ListItem,
  SectionHeader,
} from '@/components';
import { getDashboard } from '@/features/dashboard/services/dashboardService';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/authStore';

export function StaffHomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const user = useAuthStore((state) => state.user);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const dashboard = getDashboard('staff', user, selectedProject);

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('staff')}
      selectedKey="home"
      testID="staff-home-screen"
    >
      <View style={styles.container}>
        <DashboardHeader />

        <HeroMetricCard
          caption="Attendance"
          progress={0.4}
          subtitle="2 follow-ups are due before noon"
          title="Check attendance and open CRM priorities"
        />

        <View style={styles.metrics}>
          {dashboard.stats.map((metric) => (
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
          {dashboard.priorities.map((item) => (
            <ActionTile
              hint="Priority for field operations today"
              icon="checkmark-done-outline"
              key={item.key}
              label={item.label}
              onPress={() => router.push(item.route as never)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            actionLabel="Open CRM"
            onPressAction={() => router.push('/(app)/crm')}
            title="Recent lead activity"
          />
          {dashboard.recentActivity.map((item, index) => (
            <ListItem
              icon="ellipse-outline"
              key={item}
              onPress={() =>
                router.push({
                  params: { leadId: `lead-${Math.min(index + 1, 3)}` },
                  pathname: '/(app)/lead-detail',
                })
              }
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
  metrics: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
});
