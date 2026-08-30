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
  variant: 'featured' | 'mini';
};

export function FinancialSummaryCard({
  item,
  onPress,
  variant,
}: FinancialSummaryCardProps) {
  const { theme } = useAppTheme();
  const formattedAmount = formatPkrAmount(item.amount);
  const isFeatured = variant === 'featured';

  return (
    <Pressable
      accessibilityLabel={`${item.label}: ${formattedAmount}`}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        isFeatured ? styles.featuredPressable : styles.miniCard,
        { opacity: pressed ? 0.84 : 1 },
      ]}
      testID={`financial-card-${item.key}`}
    >
      <AppCard
        padding="none"
        style={[
          isFeatured ? styles.featuredCard : styles.miniCardSurface,
          {
            backgroundColor: isFeatured ? theme.colors.primarySoft : theme.colors.surface,
            borderColor: isFeatured
              ? 'rgba(40, 120, 240, 0.18)'
              : theme.colors.border,
          },
        ]}
        surface="elevated"
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isFeatured
                ? 'rgba(40, 120, 240, 0.14)'
                : theme.colors.surfaceMuted,
            },
          ]}
        >
          <Ionicons color={theme.colors.primary} name={item.icon} size={22} />
        </View>

        <View style={isFeatured ? styles.featuredCopy : styles.miniCopy}>
          <AppText variant="labelStrong">{item.label}</AppText>
          <AppText
            adjustsFontSizeToFit
            minimumFontScale={isFeatured ? 0.72 : 0.7}
            numberOfLines={1}
            style={isFeatured ? styles.featuredAmount : styles.miniAmount}
            variant={isFeatured ? 'numericHero' : 'labelStrong'}
          >
            {formattedAmount}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {item.supportText}
          </AppText>
          {isFeatured && item.metaLabel ? (
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {item.metaLabel}
            </AppText>
          ) : null}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featuredAmount: {
    fontSize: 26,
    lineHeight: 30,
  },
  featuredCard: {
    gap: 12,
    minHeight: 132,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  featuredCopy: {
    gap: 4,
    minWidth: 0,
  },
  featuredPressable: {
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  miniAmount: {
    color: '#102033',
    fontSize: 17,
    lineHeight: 22,
    marginTop: 6,
  },
  miniCard: {
    flex: 1,
    minWidth: 0,
  },
  miniCardSurface: {
    gap: 10,
    minHeight: 116,
    padding: 14,
  },
  miniCopy: {
    gap: 6,
    minWidth: 0,
  },
});
