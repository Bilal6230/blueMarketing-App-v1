import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  BrandLockup,
  InlineMessage,
  SectionHeader,
} from '@/components';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { dashboardFixtures } from '@/features/dashboard/data/dashboardFixtures';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAuthStore } from '@/store/authStore';

export function ProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const roles = useAuthStore((state) => state.roles);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const projects = useAuthStore((state) => state.projects);
  const user = useAuthStore((state) => state.user);
  const role = resolvePrimaryRole(roles);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  return (
    <AppTabScaffold
      items={getBottomNavigationItems(role)}
      selectedKey="profile"
      testID="profile-screen"
    >
      <BrandLockup subtitle="Account overview" />
      <AppCard surface="elevated">
        <View style={styles.identity}>
          <SectionHeader
            subtitle="Temporary local session"
            title={user?.name ?? 'Blue Marketing user'}
          />
          <AppText color="textSecondary" variant="body">
            {user?.email ?? 'No email available'}
          </AppText>
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.detailGroup}>
          <View style={styles.detailRow}>
            <AppText color="textSecondary" variant="captionStrong">
              Role
            </AppText>
            <AppText variant="labelStrong">
              {role === 'administrator' ? 'Administrator' : 'Staff'}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText color="textSecondary" variant="captionStrong">
              Project
            </AppText>
            <AppText variant="labelStrong">
              {selectedProject?.name ?? dashboardFixtures.shared.projectName}
            </AppText>
          </View>
        </View>
      </AppCard>

      <InlineMessage
        message="This screen uses local frontend session data until the authentication API is connected."
        title="Session boundary"
        tone="information"
      />

      <AppButton
        onPress={() => {
          void clearSession().finally(() => {
            router.replace('/(auth)/login');
          });
        }}
        title="Logout"
        variant="destructive"
      />
    </AppTabScaffold>
  );
}

const styles = StyleSheet.create({
  detailGroup: {
    gap: 18,
  },
  detailRow: {
    gap: 4,
  },
  identity: {
    gap: 6,
  },
});
