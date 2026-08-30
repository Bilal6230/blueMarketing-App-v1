import { View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export type StatusBadgeVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'overdue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'information'
  | 'neutral';

type StatusBadgeProps = {
  label: string;
  variant: StatusBadgeVariant;
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const { theme } = useAppTheme();
  const token = theme.component.badge[variant];

  return (
    <View
      accessibilityLabel={`${label} status`}
      accessibilityRole="text"
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: token.background,
        borderRadius: theme.radius.pill,
        flexDirection: 'row',
        minHeight: 28,
        paddingHorizontal: 10,
      }}
    >
      <AppText style={{ color: token.foreground }} variant="captionStrong">
        {label}
      </AppText>
    </View>
  );
}
