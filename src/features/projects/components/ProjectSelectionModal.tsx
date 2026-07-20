import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/layout/AppCard';
import { AppButton } from '@/components/controls/AppButton';
import { AppText } from '@/components/controls/AppText';
import { ListItem } from '@/components/data-display/ListItem';
import type { ProjectSummary } from '@/types/project';

type ProjectSelectionModalProps = {
  onClose: () => void;
  onSelect: (projectId: number) => void;
  projects: ProjectSummary[];
  selectedProjectId: number | null;
  visible: boolean;
};

export function ProjectSelectionModal({
  onClose,
  onSelect,
  projects,
  selectedProjectId,
  visible,
}: ProjectSelectionModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <AppCard style={styles.card} surface="elevated">
          <AppText variant="headingSmall">Select project</AppText>
          <AppText color="textSecondary" variant="body">
            Choose the project you want to work on now.
          </AppText>
          <View style={styles.list}>
            {projects.map((project) => (
              <ListItem
                accessory={
                  project.id === selectedProjectId ? (
                    <AppText variant="captionStrong">Current</AppText>
                  ) : undefined
                }
                icon="business-outline"
                key={project.id}
                onPress={() => onSelect(project.id)}
                subtitle="Project workspace"
                title={project.name}
              />
            ))}
          </View>
          <AppButton onPress={onClose} title="Close" variant="secondary" />
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 460,
    width: '100%',
  },
  list: {
    gap: 10,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
