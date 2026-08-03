import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
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
  const [miniGridWidth, setMiniGridWidth] = useState(0);
  const totalCash = items.find((item) => item.key === 'total-cash');
  const miniItems = items.filter((item) => item.key !== 'total-cash');
  const stackMiniCards = miniGridWidth > 0 && miniGridWidth < 348;

  const handleMiniGridLayout = (event: LayoutChangeEvent) => {
    setMiniGridWidth(event.nativeEvent.layout.width);
  };

  if (!totalCash) {
    return null;
  }

  return (
    <View style={styles.section} testID="financial-summary">
      <AppText variant="headingMedium">Financial Summary</AppText>

      <FinancialSummaryCard
        item={totalCash}
        onPress={() => onPressItem(totalCash)}
        variant="featured"
      />

      <View
        onLayout={handleMiniGridLayout}
        style={[styles.miniGrid, stackMiniCards ? styles.miniGridStacked : null]}
      >
        {miniItems.map((item) => (
          <FinancialSummaryCard
            item={item}
            key={item.key}
            onPress={() => onPressItem(item)}
            variant="mini"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  miniGridStacked: {
    flexDirection: 'column',
  },
  section: {
    gap: 14,
    width: '100%',
  },
});
