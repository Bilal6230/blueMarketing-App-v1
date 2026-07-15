import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type AppCardProps = PropsWithChildren<{
  accessible?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  surface?: 'default' | 'muted' | 'elevated';
  testID?: string;
}>;

export function AppCard({
  accessible,
  children,
  padding = 'md',
  style,
  surface = 'default',
  testID,
}: AppCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessible={accessible}
      style={[
        styles.card,
        {
          backgroundColor: resolveSurface(theme.colors, surface),
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[padding],
          ...theme.elevation.card,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

function resolveSurface(
  colors: ReturnType<typeof useAppTheme>['theme']['colors'],
  surface: AppCardProps['surface'],
) {
  switch (surface) {
    case 'muted':
      return colors.surfaceMuted;
    case 'elevated':
      return colors.surfaceElevated;
    case 'default':
    default:
      return colors.surface;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 12,
  },
});
