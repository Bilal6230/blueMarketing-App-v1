import { Redirect, Stack } from 'expo-router';

import { AuthLoadingScreen } from '@/features/auth';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'booting') {
    return <AuthLoadingScreen />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(app)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
