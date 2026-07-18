import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppCard,
  AppHeader,
  AppTabScaffold,
  AppText,
  HeroMetricCard,
  InlineMessage,
  InsightRow,
  MetricCard,
  ProgressBar,
  ProjectPill,
  SectionHeader,
} from '@/components';
import { adminDashboardMock } from '@/mocks/dashboard';
import { previewUsers } from '@/mocks/user';
import { adminPreviewNavigation } from '@/features/preview/navigationModel';
import { warningFeedback } from '@/services/haptics';

export function AdminHomeScreen() {
  const [notice, setNotice] = useState<string | null>(null);
  const navigation = adminPreviewNavigation.map((item) =>
    item.href
      ? item
      : {
          ...item,
          onPress: async () => {
            await warningFeedback();
            setNotice(`${item.label} arrives in a later sprint.`);
          },
        },
  );

  return (
    <AppTabScaffold
      items={navigation}
      selectedKey="home"
      testID="admin-home-screen"
    >
      <View style={styles.container}>
        <AppHeader
          leftAction={
            <ProjectPill
              label={previewUsers.admin.project}
              onPress={async () => {
                await warningFeedback();
                setNotice(
                  'Project selection remains a preview-only control in this sprint.',
                );
              }}
            />
          }
          subtitle="Project overview"
          title="Administrator command"
        />
        {notice ? (
          <InlineMessage
            message={notice}
            title="Preview-only navigation"
            tone="warning"
          />
        ) : null}

        <HeroMetricCard
          caption="Recovery hero metric"
          progress={0.785}
          subtitle="of PKR 61.4M"
          title="PKR 48.2M received"
        />

        <View style={styles.metricGrid}>
          {adminDashboardMock.metrics.map((metric) => (
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
          {adminDashboardMock.alerts.map((item) => (
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
            subtitle="Compact progress substitute for charts"
            title="Sales and collection metrics"
          />
          <View style={styles.bars}>
            {adminDashboardMock.overviewBars.map((bar) => (
              <View key={bar.label} style={styles.barRow}>
                <AppText variant="labelStrong">{bar.label}</AppText>
                <ProgressBar progress={bar.progress} />
              </View>
            ))}
          </View>
        </AppCard>

        <View style={styles.section}>
          <SectionHeader title="Recent activity" />
          {adminDashboardMock.recentActivity.map((item) => (
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
