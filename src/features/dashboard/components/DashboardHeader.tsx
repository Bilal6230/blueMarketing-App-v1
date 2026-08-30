import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';

import { AppText } from '@/components/controls/AppText';
import { DashboardProjectDropdown } from '@/features/dashboard/components/DashboardProjectDropdown';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/authStore';

type DropdownAnchor = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export function DashboardHeader() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const projectSelectorRef = useRef<View | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<DropdownAnchor | null>(
    null,
  );
  const [projectDropdownVisible, setProjectDropdownVisible] = useState(false);
  const hasProjects = projects.length > 0;
  const canOpenDropdown = projects.length > 0;

  const handleProjectSelectorPress = () => {
    if (!canOpenDropdown) {
      return;
    }

    projectSelectorRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownAnchor({ height, width, x, y });
      setProjectDropdownVisible(true);
    });
  };

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

        <View
          collapsable={false}
          ref={projectSelectorRef}
          style={styles.projectSelectorWrapper}
        >
          <Pressable
            accessibilityLabel="Select project"
            accessibilityRole="button"
            disabled={!hasProjects}
            onPress={handleProjectSelectorPress}
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
              name={projectDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      <DashboardProjectDropdown
        anchor={dropdownAnchor}
        onClose={() => setProjectDropdownVisible(false)}
        onSelect={(projectId) => {
          void setSelectedProject(projectId).finally(() => {
            setProjectDropdownVisible(false);
          });
        }}
        projects={projects}
        selectedProjectId={selectedProjectId}
        visible={projectDropdownVisible}
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
  projectSelectorWrapper: {
    flex: 1,
    minWidth: 0,
  },
  projectSelector: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: 14,
  },
});
