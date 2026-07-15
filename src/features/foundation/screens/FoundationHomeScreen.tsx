import { StyleSheet, View } from 'react-native';

import { AppCard, AppText, Screen } from '@/components';
import { testIds } from '@/utils/testIds';

export function FoundationHomeScreen() {
  return (
    <Screen scrollable={false} testID={testIds.foundationScreen}>
      <View style={styles.content}>
        <AppCard padding="lg" surface="elevated">
          <AppText color="primary" variant="eyebrow">
            Blue Marketing
          </AppText>
          <AppText variant="title">Application foundation ready</AppText>
          <AppText color="textSecondary">
            Theme, navigation, API infrastructure and secure session services are configured.
          </AppText>
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
