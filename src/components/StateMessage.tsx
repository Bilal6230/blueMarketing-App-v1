import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';

type StateVariant = 'loading' | 'empty' | 'error' | 'offline' | 'unauthorized';

type StateMessageProps = {
  body: string;
  title: string;
  variant: StateVariant;
};

const variantTone: Record<
  StateVariant,
  'primary' | 'warning' | 'danger' | 'textMuted'
> = {
  empty: 'textMuted',
  error: 'danger',
  loading: 'primary',
  offline: 'warning',
  unauthorized: 'warning',
};

export function StateMessage({ body, title, variant }: StateMessageProps) {
  return (
    <AppCard padding="lg" surface="muted">
      <View style={styles.stack}>
        <AppText color={variantTone[variant]} variant="eyebrow">
          {variant}
        </AppText>
        <AppText variant="title">{title}</AppText>
        <AppText color="textSecondary">{body}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
