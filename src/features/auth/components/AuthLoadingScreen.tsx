import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, BrandLockup } from '@/components';
import { Screen } from '@/components/layout/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { testIds } from '@/utils/testIds';

type AuthLoadingScreenProps = {
  message?: string;
};

export function AuthLoadingScreen({
  message = 'Preparing your workspace',
}: AuthLoadingScreenProps) {
  const { theme } = useAppTheme();

  return (
    <Screen
      contentContainerStyle={styles.content}
      keyboardAware={false}
      scrollable={false}
      testID={testIds.appBootScreen}
    >
      <View style={styles.inner}>
        <BrandLockup subtitle="Operations workspace" />
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <AppText color="textSecondary" variant="body">
          {message}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: 18,
  },
});
