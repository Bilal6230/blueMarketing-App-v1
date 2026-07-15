import { StyleSheet, View } from 'react-native';

import { AppCard, AppText, Screen } from '@/components';
import { APP_NAME, APP_TAGLINE } from '@/config/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { testIds } from '@/utils/testIds';

export function LoginPlaceholderScreen() {
  const { theme } = useAppTheme();

  return (
    <Screen contentContainerStyle={styles.container} testID={testIds.loginScreen}>
      <View style={styles.topSpacing} />
      <AppCard padding="lg" style={styles.card} surface="elevated">
        <AppText color="primary" variant="eyebrow">
          {APP_NAME}
        </AppText>
        <AppText variant="title">{APP_TAGLINE}</AppText>
        <AppText color="textSecondary">
          Secure access for authorised team members.
        </AppText>
        <View style={[styles.divider, { borderColor: theme.colors.borderStrong }]} />
        <AppText color="textMuted">
          Authentication integration will be added in the next sprint.
        </AppText>
      </AppCard>
      <View style={styles.bottomSpacing} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomSpacing: {
    flex: 1,
  },
  card: {
    gap: 14,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  topSpacing: {
    flex: 0.7,
  },
});
