import { Redirect } from 'expo-router';

import { AuthLoadingScreen } from '@/features/auth';
import { useAuthStore } from '@/store/authStore';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);

  if (status === 'booting') {
    return <AuthLoadingScreen />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
