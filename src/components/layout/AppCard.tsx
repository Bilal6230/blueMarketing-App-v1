import type { PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type AppCardProps = PropsWithChildren<
  ViewProps & {
    padding?: 'none' | 'md' | 'lg';
    style?: StyleProp<ViewStyle>;
    surface?: 'default' | 'elevated' | 'muted';
    testID?: string;
  }
>;

export function AppCard({
  children,
  padding = 'md',
  style,
  surface = 'default',
  testID,
  ...props
}: AppCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        theme.elevation.card,
        {
          backgroundColor:
            surface === 'elevated'
              ? theme.component.card.elevatedBackground
              : surface === 'muted'
                ? theme.component.card.mutedBackground
                : theme.component.card.defaultBackground,
          borderColor: theme.component.card.defaultBorder,
          borderRadius: theme.radius.xLarge,
          padding:
            padding === 'none'
              ? 0
              : padding === 'lg'
                ? theme.spacing.cardPadding
                : theme.spacing.lg,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 12,
  },
});
