import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { AppText } from '@/components/controls/AppText';
import { ProjectSelectionModal } from '@/features/projects/components/ProjectSelectionModal';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/authStore';

export function DashboardHeader() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const hasProjects = projects.length > 0;

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.replace('/(app)/profile')}
          style={({ pressed }) => [
            styles.logoButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Image
            resizeMode="contain"
            source={require('../../../../assets/images/blue-marketing-logo.png')}
            style={styles.logo}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Select project"
          accessibilityRole="button"
          disabled={!hasProjects}
          onPress={() => setProjectModalVisible(true)}
          style={({ pressed }) => [
            styles.projectSelector,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed && hasProjects ? 0.85 : 1,
            },
          ]}
        >
          <AppText
            numberOfLines={1}
            style={styles.projectName}
            variant="labelStrong"
          >
            {selectedProject?.name ?? 'Select project'}
          </AppText>

          <Ionicons
            color={theme.colors.textSecondary}
            name="chevron-down"
            size={18}
          />
        </Pressable>
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logo: {
    height: 48,
    width: 48,
  },
  logoButton: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  projectName: {
    flex: 1,
    minWidth: 0,
  },
  projectSelector: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: 14,
  },
});
