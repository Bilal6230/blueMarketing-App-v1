import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { ProgressBar } from '@/components/data-display/ProgressBar';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';

type HeroMetricCardProps = {
  caption: string;
  progress?: number;
  subtitle: string;
  title: string;
};

export function HeroMetricCard({
  caption,
  progress,
  subtitle,
  title,
}: HeroMetricCardProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard padding="none" style={styles.card}>
      <LinearGradient
        colors={[theme.colors.gradientHeroStart, theme.colors.gradientHeroEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: theme.radius.xLarge }]}
      >
        <View style={styles.stack}>
          <AppText color="surface" variant="label">
            {caption}
          </AppText>
          <AppText color="surface" variant="numericHero">
            {title}
          </AppText>
          <AppText
            color="surface"
            style={{ opacity: 0.84 }}
            variant="bodyLarge"
          >
            {subtitle}
          </AppText>
          {typeof progress === 'number' ? (
            <ProgressBar progress={progress} tone="info" />
          ) : null}
        </View>
      </LinearGradient>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  stack: {
    gap: 10,
  },
});
