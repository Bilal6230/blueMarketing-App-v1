import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  BottomNavigationItem,
  type BottomNavigationRoute,
} from '@/components/navigation/BottomNavigationItem';
import { selectionFeedback } from '@/services/haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

type BottomNavigationProps = {
  items: BottomNavigationRoute[];
  selectedKey: string;
};

export function BottomNavigation({
  items,
  selectedKey,
}: BottomNavigationProps) {
  const { theme } = useAppTheme();
  const router = useRouter();

  const content = (
    <View
      style={[
        styles.content,
        {
          backgroundColor: theme.component.navigation.barBackground,
          borderColor: theme.component.navigation.barBorder,
        },
      ]}
    >
      {items.map((item) => (
        <BottomNavigationItem
          item={item}
          key={item.key}
          onPress={async () => {
            if (item.key === selectedKey) {
              return;
            }

            await selectionFeedback();
            if (item.onPress) {
              await item.onPress();
              return;
            }
            if (item.href) {
              router.replace(item.href as never);
            }
          }}
          selected={item.key === selectedKey}
        />
      ))}
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={24} style={styles.blur} tint="systemMaterial">
        {content}
      </BlurView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'stretch',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: '100%',
  },
});
