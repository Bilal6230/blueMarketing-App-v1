import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  DashboardHeader,
} from '@/components';
import { AttentionPanel } from '@/features/dashboard/components/AttentionPanel';
import { AdminStatusGrid } from '@/features/dashboard/components/AdminStatusGrid';
import { FinancialSummary } from '@/features/dashboard/components/FinancialSummary';
import { PerformancePanel } from '@/features/dashboard/components/PerformancePanel';
import { RecentActivityTimeline } from '@/features/dashboard/components/RecentActivityTimeline';
import {
  type AdminStatusItem,
  type AttentionItem,
  getDashboard,
  type OverviewBarItem,
  type RecentActivityItem,
} from '@/features/dashboard/services/dashboardService';
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

  const openDetailModal = (title: string, body: string[]) => {
    setDetailModal({ body, title });
  };

  const handleStatusPress = (item: AdminStatusItem) => {
    openDetailModal(item.detailTitle, item.detailBody);
  };

  const handleAttentionPress = (item: AttentionItem) => {
    if (item.actionType === 'alert-overdue') {
      router.push({
        params: { status: 'Overdue' },
        pathname: '/(app)/crm',
      });
      return;
    }

    if (item.detailTitle && item.detailBody) {
      openDetailModal(item.detailTitle, item.detailBody);
    }
  };

  const handlePerformancePress = (item: OverviewBarItem) => {
    openDetailModal(item.detailTitle, item.detailBody);
  };

  const handleActivityPress = (item: RecentActivityItem) => {
    openDetailModal(item.detailTitle, item.detailBody);
  };

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
          onPressItem={(item) => openDetailModal(item.detailTitle, item.detailBody)}
        />

        <AdminStatusGrid
          items={dashboard.metrics}
          onPressItem={handleStatusPress}
        />

        <AttentionPanel
          items={dashboard.alerts}
          onPressItem={handleAttentionPress}
        />

        <PerformancePanel
          items={dashboard.overviewBars}
          onPressItem={handlePerformancePress}
        />

        <RecentActivityTimeline
          items={dashboard.recentActivity}
          onPressItem={handleActivityPress}
          onPressViewAll={() => router.push('/(app)/crm')}
        />
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
    gap: 22,
    width: '100%',
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
});
