import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  ActionTile,
  AppCard,
  AppText,
  BrandLockup,
  Screen,
  SectionHeader,
} from '@/components';

export function PreviewIndexScreen() {
  const router = useRouter();

  return (
    <Screen>
      <BrandLockup subtitle="Development-only prototype selector" />
      <AppCard surface="elevated">
        <AppText color="primary" variant="labelStrong">
          Development only
        </AppText>
        <AppText variant="displayMedium">Prototype review shell</AppText>
        <AppText color="textSecondary" variant="bodyLarge">
          These routes are isolated from the real authentication state and exist
          only to review the premium UI system.
        </AppText>
      </AppCard>

      <View style={styles.section}>
        <SectionHeader
          subtitle="Review the high-fidelity static experiences"
          title="Preview routes"
        />
        <ActionTile
          hint="Premium sign-in experience"
          icon="lock-closed-outline"
          label="Login prototype"
          onPress={() => router.push('/(preview)/login')}
        />
        <ActionTile
          hint="Action-first operational dashboard"
          icon="flash-outline"
          label="Staff home"
          onPress={() => router.push('/(preview)/staff-home')}
        />
        <ActionTile
          hint="Decision-first leadership dashboard"
          icon="analytics-outline"
          label="Administrator home"
          onPress={() => router.push('/(preview)/admin-home')}
        />
        <ActionTile
          hint="Lead pipeline list and filters"
          icon="people-outline"
          label="CRM list"
          onPress={() => router.push('/(preview)/crm')}
        />
        <ActionTile
          hint="Lead identity, actions and timeline"
          icon="person-outline"
          label="Lead detail"
          onPress={() => router.push('/(preview)/lead-detail')}
        />
        <ActionTile
          hint="Attendance states and weekly view"
          icon="time-outline"
          label="Attendance preview"
          onPress={() => router.push('/(preview)/attendance')}
        />
        <ActionTile
          hint="Full token and component showcase"
          icon="color-palette-outline"
          label="Design system showcase"
          onPress={() => router.push('/(preview)/design-system')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
});
