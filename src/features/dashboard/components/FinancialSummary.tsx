import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/data-display/SectionHeader';
import { FinancialSummaryCard } from '@/features/dashboard/components/FinancialSummaryCard';
import type { FinancialSummaryItem } from '@/features/dashboard/services/dashboardService';

type FinancialSummaryProps = {
  items: FinancialSummaryItem[];
  onPressItem: (item: FinancialSummaryItem) => void;
};

export function FinancialSummary({
  items,
  onPressItem,
}: FinancialSummaryProps) {
  return (
    <View style={styles.section} testID="financial-summary">
      <SectionHeader title="Financial Summary" />

      <View style={styles.cardList}>
        {items.map((item) => (
          <FinancialSummaryCard
            item={item}
            key={item.key}
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardList: {
    gap: 12,
    width: '100%',
  },
  section: {
    gap: 14,
    width: '100%',
  },
});
