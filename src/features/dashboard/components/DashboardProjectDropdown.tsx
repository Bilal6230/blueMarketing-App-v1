import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ProjectSummary } from '@/types/project';

type DropdownAnchor = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type DashboardProjectDropdownProps = {
  anchor: DropdownAnchor | null;
  onClose: () => void;
  onSelect: (projectId: number) => void;
  projects: ProjectSummary[];
  selectedProjectId: number | null;
  visible: boolean;
};

const SCREEN_PADDING = 8;
const ROW_HEIGHT = 48;
const MAX_DROPDOWN_HEIGHT = 280;
const DROPDOWN_OFFSET = 4;

export function DashboardProjectDropdown({
  anchor,
  onClose,
  onSelect,
  projects,
  selectedProjectId,
  visible,
}: DashboardProjectDropdownProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();

  if (!anchor) {
    return null;
  }

  const dropdownWidth = Math.min(anchor.width, window.width - SCREEN_PADDING * 2);
  const left = Math.min(
    Math.max(SCREEN_PADDING, anchor.x),
    window.width - dropdownWidth - SCREEN_PADDING,
  );
  const availableBelow =
    window.height - insets.bottom - SCREEN_PADDING - (anchor.y + anchor.height + DROPDOWN_OFFSET);
  const availableAbove = anchor.y - insets.top - SCREEN_PADDING - DROPDOWN_OFFSET;
  const preferredHeight = Math.min(projects.length * ROW_HEIGHT, MAX_DROPDOWN_HEIGHT);
  const openAbove = availableBelow < 120 && availableAbove > availableBelow;
  const maxHeight = Math.max(
    Math.min(openAbove ? availableAbove : availableBelow, MAX_DROPDOWN_HEIGHT),
    ROW_HEIGHT,
  );
  const top = openAbove
    ? Math.max(
        insets.top + SCREEN_PADDING,
        anchor.y - DROPDOWN_OFFSET - maxHeight,
      )
    : anchor.y + anchor.height + DROPDOWN_OFFSET;

  return (
    <Modal transparent statusBarTranslucent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.dropdown,
            {
              borderColor: theme.colors.border,
              left,
              maxHeight,
              top,
              width: dropdownWidth,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {projects.map((project, index) => {
              const selected = project.id === selectedProjectId;

              return (
                <Pressable
                  key={project.id}
                  onPress={() => onSelect(project.id)}
                  style={[
                    styles.option,
                    {
                      borderBottomColor: theme.colors.border,
                    },
                    index === projects.length - 1 ? styles.lastOption : null,
                    selected
                      ? [
                          styles.selectedOption,
                          { backgroundColor: theme.colors.primary },
                        ]
                      : null,
                  ]}
                >
                  <AppText
                    color={selected ? 'surface' : 'textPrimary'}
                    numberOfLines={1}
                    style={styles.optionText}
                    variant="labelStrong"
                  >
                    {project.name}
                  </AppText>

                  {selected ? (
                    <Ionicons color="#FFFFFF" name="checkmark" size={18} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 1,
    elevation: 8,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  option: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  selectedOption: {},
});
