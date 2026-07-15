import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
