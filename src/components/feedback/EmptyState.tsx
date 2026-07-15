import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/controls/AppButton';
import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';

type EmptyStateProps = {
  actionLabel?: string;
  onPressAction?: () => void;
  subtitle: string;
  title: string;
};

export function EmptyState({
  actionLabel,
  onPressAction,
  subtitle,
  title,
}: EmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard surface="muted">
      <View style={{ alignItems: 'center', gap: 12 }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceElevated,
            borderRadius: theme.radius.large,
            height: 52,
            justifyContent: 'center',
            width: 52,
          }}
        >
          <Ionicons
            accessibilityElementsHidden
            color={theme.colors.textMuted}
            name="sparkles-outline"
            size={24}
          />
        </View>
        <AppText align="center" variant="headingSmall">
          {title}
        </AppText>
        <AppText align="center" color="textSecondary" variant="body">
          {subtitle}
        </AppText>
        {actionLabel ? (
          <AppButton
            fullWidth={false}
            onPress={onPressAction}
            title={actionLabel}
            variant="secondary"
          />
        ) : null}
      </View>
    </AppCard>
  );
}
