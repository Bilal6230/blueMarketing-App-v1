import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export type BottomNavigationRoute = {
  href?: string;
  icon: keyof typeof Ionicons.glyphMap;
  key: string;
  label: string;
  onPress?: () => void | Promise<void>;
};

type BottomNavigationItemProps = {
  item: BottomNavigationRoute;
  onPress: () => void;
  selected: boolean;
};

export function BottomNavigationItem({
  item,
  onPress,
  selected,
}: BottomNavigationItemProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: selected
              ? theme.component.navigation.indicator
              : 'transparent',
          },
        ]}
      />
      <Ionicons
        accessibilityElementsHidden
        color={
          selected
            ? theme.component.navigation.iconSelected
            : theme.component.navigation.iconDefault
        }
        name={item.icon}
        size={20}
      />
      <AppText
        allowFontScaling={false}
        ellipsizeMode="tail"
        numberOfLines={1}
        color={selected ? 'textPrimary' : 'textMuted'}
        style={[
          styles.label,
          {
            color: selected
              ? theme.component.navigation.labelSelected
              : theme.component.navigation.labelDefault,
          },
        ]}
        variant="captionStrong"
      >
        {item.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  indicator: {
    borderRadius: 999,
    height: 3,
    width: 24,
  },
  item: {
    alignItems: 'center',
    flexBasis: 0,
    flexGrow: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    width: '100%',
  },
});
