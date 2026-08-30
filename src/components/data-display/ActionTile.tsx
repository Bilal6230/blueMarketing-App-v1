import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';
import { PressableScale } from '@/motion';
import { useAppTheme } from '@/hooks/useAppTheme';

type ActionTileProps = {
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

export function ActionTile({ hint, icon, label, onPress }: ActionTileProps) {
  const { theme } = useAppTheme();

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
    >
      <AppCard surface="elevated">
        <View style={styles.row}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: theme.colors.primarySoft,
                borderRadius: theme.radius.medium,
              },
            ]}
          >
            <Ionicons
              accessibilityElementsHidden
              color={theme.colors.primary}
              name={icon}
              size={18}
            />
          </View>
          <View style={styles.copy}>
            <AppText variant="labelStrong">{label}</AppText>
            {hint ? (
              <AppText color="textSecondary" variant="caption">
                {hint}
              </AppText>
            ) : null}
          </View>
          <Ionicons
            accessibilityElementsHidden
            color={theme.colors.textMuted}
            name="chevron-forward"
            size={18}
          />
        </View>
      </AppCard>
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
    flexDirection: 'row',
    gap: 12,
  },
});
