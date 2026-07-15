import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type ProjectPillProps = {
  label: string;
};

export function ProjectPill({ label }: ProjectPillProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={`Project ${label}`}
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primarySoft,
        borderRadius: theme.radius.pill,
        flexDirection: 'row',
        gap: 6,
        minHeight: 34,
        paddingHorizontal: 12,
      }}
    >
      <Ionicons
        accessibilityElementsHidden
        color={theme.colors.primary}
        name="business-outline"
        size={14}
      />
      <AppText color="primary" variant="captionStrong">
        {label}
      </AppText>
    </View>
  );
}
