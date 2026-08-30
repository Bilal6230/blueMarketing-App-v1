import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import type { StatusBadgeVariant } from '@/components/data-display/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';

type InlineMessageProps = {
  message: string;
  title: string;
  tone?: Exclude<
    StatusBadgeVariant,
    'active' | 'inactive' | 'pending' | 'overdue'
  >;
};

export function InlineMessage({
  message,
  title,
  tone = 'information',
}: InlineMessageProps) {
  const { theme } = useAppTheme();
  const color =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'success'
        ? theme.colors.success
        : tone === 'warning'
          ? theme.colors.warning
          : theme.colors.info;
  const background =
    tone === 'danger'
      ? theme.colors.dangerSoft
      : tone === 'success'
        ? theme.colors.successSoft
        : tone === 'warning'
          ? theme.colors.warningSoft
          : theme.colors.infoSoft;

  return (
    <View
      style={{
        backgroundColor: background,
        borderRadius: theme.radius.large,
        flexDirection: 'row',
        gap: 12,
        padding: 14,
      }}
    >
      <Ionicons
        accessibilityElementsHidden
        color={color}
        name="information-circle-outline"
        size={18}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <AppText style={{ color }} variant="labelStrong">
          {title}
        </AppText>
        <AppText color="textSecondary" variant="caption">
          {message}
        </AppText>
      </View>
    </View>
  );
}
