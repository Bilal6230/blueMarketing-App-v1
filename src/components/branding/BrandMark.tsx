import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
};

export function BrandMark({ size = 'md' }: BrandMarkProps) {
  const { theme } = useAppTheme();
  const sizes = {
    lg: 72,
    md: 52,
    sm: 36,
  } as const;
  const dimension = sizes[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.large,
          height: dimension,
          width: dimension,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor: theme.colors.gradientHeroEnd,
            borderRadius: theme.radius.medium,
          },
        ]}
      >
        <AppText
          color="surface"
          variant={size === 'lg' ? 'headingSmall' : 'title'}
        >
          BM
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  inner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
});
