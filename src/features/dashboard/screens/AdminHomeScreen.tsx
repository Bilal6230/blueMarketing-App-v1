import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  DashboardHeader,
  ListItem,
  SectionHeader,
} from '@/components';
import { FinancialSummary } from '@/features/dashboard/components/FinancialSummary';
import { getDashboard } from '@/features/dashboard/services/dashboardService';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAuthStore } from '@/store/authStore';

type DetailModalState = null | {
  body: string[];
  title: string;
};

export function AdminHomeScreen() {
  const router = useRouter();
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const user = useAuthStore((state) => state.user);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const dashboard = getDashboard('administrator', user, selectedProject);
  const [detailModal, setDetailModal] = useState<DetailModalState>(null);

  return (
    <AppTabScaffold
      items={getBottomNavigationItems('administrator')}
      selectedKey="home"
      testID="admin-home-screen"
    >
      <View style={styles.container}>
        <DashboardHeader />

        <FinancialSummary
          items={dashboard.financialSummary}
          onPressItem={(item) =>
            setDetailModal({
              body: item.detailBody,
              title: item.label,
            })
          }
        />

        <View style={styles.metricGrid}>
          {dashboard.metrics.map((metric) => (
            <ListItem
              icon={metric.icon as never}
              key={metric.key}
              onPress={() =>
                setDetailModal({
                  body: [metric.supportText, metric.detail],
                  title: metric.label,
                })
              }
              subtitle={metric.supportText}
              title={`${metric.label} \u00B7 ${metric.value}`}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            subtitle="Approvals and alerts requiring attention"
            title="Requires attention"
          />
          {dashboard.alerts.map((item) => (
            <ListItem
              icon="alert-circle-outline"
              key={item}
              onPress={() =>
                router.push({
                  params: { status: 'Overdue' },
                  pathname: '/(app)/crm',
                })
              }
              subtitle="Review with your operations team."
              title={item}
            />
          ))}
        </View>

        <AppCard surface="elevated">
          <SectionHeader
            subtitle="Operational targets for the current week"
            title="Operational performance"
          />
          {dashboard.overviewBars.map((bar) => (
            <ListItem
              icon="bar-chart-outline"
              key={bar.label}
              onPress={() =>
                setDetailModal({
                  body: [
                    `Current progress: ${Math.round(bar.progress * 100)}%.`,
                  ],
                  title: bar.label,
                })
              }
              subtitle={`${Math.round(bar.progress * 100)}% complete`}
              title={bar.label}
            />
          ))}
        </AppCard>

        <View style={styles.section}>
          <SectionHeader
            actionLabel="Open CRM"
            onPressAction={() => router.push('/(app)/crm')}
            title="Recent activity"
          />
          {dashboard.recentActivity.map((item, index) => (
            <ListItem
              icon="document-text-outline"
              key={item}
              onPress={() =>
                setDetailModal({
                  body: [
                    item,
                    `Reference ${index + 1} for ${dashboard.projectName}.`,
                  ],
                  title: 'Activity detail',
                })
              }
              subtitle="Operational summary update"
              title={item}
            />
          ))}
        </View>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setDetailModal(null)}
        transparent
        visible={Boolean(detailModal)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setDetailModal(null)}
            style={StyleSheet.absoluteFill}
          />
          <AppCard style={styles.modalCard} surface="elevated">
            <AppText variant="headingSmall">{detailModal?.title}</AppText>
            {detailModal?.body.map((line) => (
              <AppText key={line} color="textSecondary" variant="body">
                {line}
              </AppText>
            ))}
            <AppButton
              onPress={() => setDetailModal(null)}
              title="Close"
              variant="secondary"
            />
          </AppCard>
        </View>
      </Modal>
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    width: '100%',
  },
  metricGrid: {
    gap: 12,
  },
  modalCard: {
    maxWidth: 460,
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  section: {
    gap: 12,
  },
});
