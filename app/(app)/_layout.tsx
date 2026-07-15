import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function AppLayout() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
