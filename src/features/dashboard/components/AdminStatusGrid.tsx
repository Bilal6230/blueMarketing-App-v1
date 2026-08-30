import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/layout/AppCard';
import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AdminStatusItem } from '@/features/dashboard/services/dashboardService';

type AdminStatusGridProps = {
  items: AdminStatusItem[];
  onPressItem: (item: AdminStatusItem) => void;
};

export function AdminStatusGrid({
  items,
  onPressItem,
}: AdminStatusGridProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const toneColor =
          item.tone === 'warning' ? theme.colors.warning : theme.colors.primary;
        const toneBackground =
          item.tone === 'warning'
            ? theme.colors.warningSoft
            : theme.colors.primarySoft;

        return (
          <Pressable
            accessibilityLabel={`${item.label}: ${item.count}`}
            accessibilityRole="button"
            key={item.key}
            onPress={() => onPressItem(item)}
            style={({ pressed }) => [
              styles.pressable,
              { opacity: pressed ? 0.86 : 1 },
            ]}
          >
            <AppCard padding="none" style={styles.statusCard} surface="elevated">
              <View
                style={[styles.iconWrap, { backgroundColor: toneBackground }]}
              >
                <Ionicons color={toneColor} name={item.icon} size={18} />
              </View>
              <AppText variant="displayMedium">{String(item.count)}</AppText>
              <AppText variant="title">{item.label}</AppText>
              <View style={styles.footerRow}>
                <AppText
                  color="textSecondary"
                  numberOfLines={1}
                  style={styles.supportText}
                  variant="caption"
                >
                  {item.supportText}
                </AppText>
                <Ionicons
                  color={theme.colors.textMuted}
                  name="chevron-forward"
                  size={16}
                />
              </View>
            </AppCard>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 14,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  statusCard: {
    gap: 10,
    minHeight: 130,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  supportText: {
    flex: 1,
    marginRight: 8,
  },
});
