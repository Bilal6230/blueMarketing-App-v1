import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '@/providers/AppProviders';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
