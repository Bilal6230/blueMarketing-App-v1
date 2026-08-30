import { View } from 'react-native';

import { SkeletonBlock } from '@/components/feedback/SkeletonBlock';
import { AppCard } from '@/components/layout/AppCard';

export function SkeletonCard() {
  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <SkeletonBlock height={12} width="40%" />
        <SkeletonBlock height={22} width="70%" />
        <SkeletonBlock height={12} width="55%" />
      </View>
    </AppCard>
  );
}
