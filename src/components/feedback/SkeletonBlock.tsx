import { View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type SkeletonBlockProps = {
  height: number;
  width?: number | `${number}%`;
};

export function SkeletonBlock({ height, width = '100%' }: SkeletonBlockProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel="Loading placeholder"
      accessibilityRole="progressbar"
      style={{
        backgroundColor: theme.component.skeleton.base,
        borderRadius: theme.radius.medium,
        height,
        width,
      }}
    />
  );
}
