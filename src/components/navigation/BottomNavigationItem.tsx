import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
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
    <PressableScale
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.item}
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
        color={selected ? 'textPrimary' : 'textMuted'}
        style={{
          color: selected
            ? theme.component.navigation.labelSelected
            : theme.component.navigation.labelDefault,
        }}
        variant="captionStrong"
      >
        {item.label}
      </AppText>
    </PressableScale>
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
    flex: 1,
    gap: 6,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
