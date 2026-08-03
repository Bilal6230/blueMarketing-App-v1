import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppTabScaffold,
  AppText,
  Avatar,
  ProjectPill,
  SectionHeader,
} from '@/components';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { ProjectSelectionModal } from '@/features/projects/components/ProjectSelectionModal';
import { useAuthStore } from '@/store/authStore';

export function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const roles = useAuthStore((state) => state.roles);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const projects = useAuthStore((state) => state.projects);
  const user = useAuthStore((state) => state.user);
  const role = resolvePrimaryRole(roles);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const initials = user?.name
    ?.split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogoutPress = () => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out of Blue Marketing?',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Log out',
          onPress: () => {
            setIsLoggingOut(true);
            void logout()
              .then(() => {
                router.replace('/(auth)/login');
              })
              .catch(() => {
                setIsLoggingOut(false);
              });
          },
        },
      ],
    );
  };

  return (
    <AppTabScaffold
      items={getBottomNavigationItems(role)}
      selectedKey="profile"
      testID="profile-screen"
    >
      <AppCard surface="elevated">
        <View style={styles.identity}>
          <SectionHeader
            subtitle="Account"
            title={user?.name ?? 'Blue Marketing'}
          />
          {initials ? <Avatar initials={initials} /> : null}
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
            <ProjectPill
              label={selectedProject?.name ?? 'No project selected'}
              onPress={
                projects.length > 1
                  ? () => setProjectModalVisible(true)
                  : undefined
              }
            />
          </View>
        </View>
      </AppCard>

      <AppButton
        loading={isLoggingOut}
        onPress={handleLogoutPress}
        testID="profile-logout-button"
        title="Logout"
        variant="destructive"
      />
      <ProjectSelectionModal
        onClose={() => setProjectModalVisible(false)}
        onSelect={(projectId) => {
          void setSelectedProject(projectId).finally(() => {
            setProjectModalVisible(false);
          });
        }}
        projects={projects}
        selectedProjectId={selectedProjectId}
        visible={projectModalVisible}
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
