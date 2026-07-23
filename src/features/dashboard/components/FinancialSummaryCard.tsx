import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FinancialSummaryItem } from '@/features/dashboard/services/dashboardService';
import { formatPkrAmount } from '@/utils/currency';

type FinancialSummaryCardProps = {
  item: FinancialSummaryItem;
  onPress: () => void;
};

export function FinancialSummaryCard({
  item,
  onPress,
}: FinancialSummaryCardProps) {
  const { theme } = useAppTheme();
  const formattedAmount = formatPkrAmount(item.amount);
  const isTotalCard = item.key === 'total-cash';

  return (
    <Pressable
      accessibilityLabel={`${item.label}: ${formattedAmount}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardPressable,
        { opacity: pressed ? 0.82 : 1 },
      ]}
      testID={`financial-card-${item.key}`}
    >
      <AppCard
        padding="none"
        style={[
          styles.card,
          {
            borderColor: isTotalCard
              ? 'rgba(10, 66, 134, 0.16)'
              : theme.component.card.defaultBorder,
          },
          isTotalCard
            ? {
                backgroundColor: theme.colors.primarySoft,
              }
            : null,
        ]}
        surface="elevated"
      >
        <View style={styles.leftContent}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isTotalCard
                  ? 'rgba(10, 66, 134, 0.14)'
                  : theme.colors.primarySoft,
              },
            ]}
          >
            <Ionicons color={theme.colors.primary} name={item.icon} size={22} />
          </View>

          <View style={styles.cardCopy}>
            <AppText variant="labelStrong">{item.label}</AppText>
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {item.supportText}
            </AppText>
          </View>
        </View>

        <AppText
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={styles.amount}
          variant="numericMedium"
        >
          {formattedAmount}
        </AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22,
    maxWidth: '48%',
    textAlign: 'right',
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  cardCopy: {
    gap: 3,
    minWidth: 0,
    maxWidth: '100%',
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 12,
    minWidth: 0,
    width: '52%',
  },
  cardPressable: {
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
