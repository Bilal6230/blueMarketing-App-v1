import { Redirect } from 'expo-router';

import { isUiPreviewEnabled } from '@/config/isUiPreviewEnabled';
import { useAuthStore } from '@/store/authStore';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);

  if (isUiPreviewEnabled()) {
    return <Redirect href="/(preview)" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
