import { Redirect, Stack } from 'expo-router';

import { isUiPreviewEnabled } from '@/config/isUiPreviewEnabled';

export default function PreviewLayout() {
  if (!isUiPreviewEnabled()) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
