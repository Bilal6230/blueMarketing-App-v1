import { View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { SkeletonCard } from '@/components/feedback/SkeletonCard';

export function LoadingState() {
  return (
    <View style={{ gap: 12 }}>
      <AppText variant="headingSmall">Loading</AppText>
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}
