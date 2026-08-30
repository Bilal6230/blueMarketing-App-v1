import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PressableScale } from '@/motion';

type ProjectPillProps = {
  label: string;
  onPress?: () => void;
};

export function ProjectPill({ label, onPress }: ProjectPillProps) {
  const { theme } = useAppTheme();
  const Container = onPress ? PressableScale : View;

  return (
    <Container
      accessibilityLabel={`Project ${label}`}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
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
    </Container>
  );
}
