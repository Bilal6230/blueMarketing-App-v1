import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AttentionItem } from '@/features/dashboard/services/dashboardService';

type AttentionPanelProps = {
  items: AttentionItem[];
  onPressItem: (item: AttentionItem) => void;
};

export function AttentionPanel({ items, onPressItem }: AttentionPanelProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard padding="none" style={styles.panel} surface="elevated">
      <View style={styles.header}>
        <AppText variant="headingMedium">Requires attention</AppText>
        <AppText color="textSecondary" variant="caption">
          {items.length} items need review
        </AppText>
      </View>

      <View style={styles.rows}>
        {items.map((item, index) => {
          const toneColor =
            item.tone === 'warning'
              ? theme.colors.warning
              : item.tone === 'info'
                ? theme.colors.info
                : theme.colors.primary;
          const toneBackground =
            item.tone === 'warning'
              ? theme.colors.warningSoft
              : item.tone === 'info'
                ? theme.colors.infoSoft
                : theme.colors.primarySoft;

          return (
            <Pressable
              accessibilityLabel={`${item.title}: ${item.count}`}
              accessibilityRole="button"
              key={item.key}
              onPress={() => onPressItem(item)}
              style={({ pressed }) => [
                styles.row,
                index < items.length - 1
                  ? {
                      borderBottomColor: theme.colors.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    }
                  : null,
                { opacity: pressed ? 0.84 : 1 },
              ]}
            >
              <View
                style={[styles.rowIcon, { backgroundColor: toneBackground }]}
              >
                <Ionicons color={toneColor} name={item.icon} size={18} />
              </View>
              <AppText style={styles.rowTitle} variant="bodyStrong">
                {item.title}
              </AppText>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: toneBackground },
                ]}
              >
                <AppText style={{ color: toneColor }} variant="captionStrong">
                  {String(item.count)}
                </AppText>
              </View>
              <Ionicons
                color={theme.colors.textSecondary}
                name="chevron-forward"
                size={16}
              />
            </Pressable>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  header: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  panel: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rows: {
    paddingTop: 8,
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
  },
});
