import { useRouter } from 'expo-router';

import { IconButton } from '@/components/controls/IconButton';

export function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Go back"
      icon="arrow-back-outline"
      onPress={() => router.back()}
    />
  );
}
