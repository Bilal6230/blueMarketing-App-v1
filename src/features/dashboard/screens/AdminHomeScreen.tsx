import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppCard,
  AppHeader,
  AppTabScaffold,
  AppText,
  HeroMetricCard,
  InsightRow,
  MetricCard,
  ProgressBar,
  ProjectPill,
  SectionHeader,
} from '@/components';
import { dashboardFixtures } from '@/features/dashboard/data/dashboardFixtures';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';

export function AdminHomeScreen() {
  const router = useRouter();

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('administrator')}
      selectedKey="home"
      testID="admin-home-screen"
    >
      <View style={styles.container}>
        <AppHeader
          leftAction={
            <ProjectPill label={dashboardFixtures.shared.projectName} />
          }
          subtitle={dashboardFixtures.shared.dateLabel}
          title="Administrator dashboard"
        />

        <HeroMetricCard
          caption="Collections"
          progress={0.785}
          subtitle="of PKR 61.4M"
          title="PKR 48.2M received"
        />

        <View style={styles.metricGrid}>
          {dashboardFixtures.administrator.metrics.map((metric) => (
            <MetricCard
              icon={metric.icon as never}
              key={metric.label}
              label={metric.label}
              supportText={metric.supportText}
              value={metric.value}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            subtitle="Approvals and alerts requiring attention"
            title="Requires attention"
          />
          {dashboardFixtures.administrator.alerts.map((item) => (
            <InsightRow
              detail="Review with your operations team."
              icon="alert-circle-outline"
              key={item}
              title={item}
              tone="warning"
            />
          ))}
        </View>

        <AppCard surface="elevated">
          <SectionHeader
            subtitle="Operational targets for the current week"
            title="Sales and collection metrics"
          />
          <View style={styles.bars}>
            {dashboardFixtures.administrator.overviewBars.map((bar) => (
              <View key={bar.label} style={styles.barRow}>
                <AppText variant="labelStrong">{bar.label}</AppText>
                <ProgressBar progress={bar.progress} />
              </View>
            ))}
          </View>
        </AppCard>

        <View style={styles.section}>
          <SectionHeader
            actionLabel="Open CRM"
            onPressAction={() => router.push('/(app)/crm')}
            title="Recent activity"
          />
          {dashboardFixtures.administrator.recentActivity.map((item) => (
            <AppCard key={item} surface="muted">
              <AppText variant="labelStrong">{item}</AppText>
              <AppText color="textSecondary" variant="caption">
                Operational summary update
              </AppText>
            </AppCard>
          ))}
        </View>
      </View>
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  barRow: {
    gap: 8,
  },
  bars: {
    gap: 14,
  },
  container: {
    gap: 24,
  },
  metricGrid: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
});
