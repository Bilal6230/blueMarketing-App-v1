import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

type ListItemProps = {
  accessory?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  subtitle?: string;
  title: string;
};

export function ListItem({
  accessory,
  icon,
  onPress,
  subtitle,
  title,
}: ListItemProps) {
  const { theme } = useAppTheme();

  return (
    <PressableScale
      accessibilityLabel={title}
      accessibilityRole={onPress ? 'button' : 'text'}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.large,
        },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radius.medium,
            },
          ]}
        >
          <Ionicons
            accessibilityElementsHidden
            color={theme.colors.textPrimary}
            name={icon}
            size={18}
          />
        </View>
      ) : null}
      <View style={styles.copy}>
        <AppText variant="labelStrong">{title}</AppText>
        {subtitle ? (
          <AppText color="textSecondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {accessory}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  row: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
