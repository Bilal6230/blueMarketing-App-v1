import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppText, Screen } from '@/components';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <Screen contentContainerStyle={styles.content} scrollable={false}>
      <AppCard padding="lg">
        <View style={styles.stack}>
          <AppText color="textMuted" variant="label">
            Page unavailable
          </AppText>
          <AppText variant="title">We could not open that screen.</AppText>
          <AppText color="textSecondary">
            Return to the Blue Marketing entry point and continue from there.
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={({ pressed }) => [
              styles.link,
              {
                backgroundColor: pressed
                  ? theme.colors.primaryPressed
                  : theme.colors.primary,
              },
            ]}
          >
            <AppText color="surface" variant="labelStrong">
              Return home
            </AppText>
          </Pressable>
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  stack: {
    gap: 16,
  },
  link: {
    alignItems: 'center',
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
