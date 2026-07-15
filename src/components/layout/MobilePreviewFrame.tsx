import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export function MobilePreviewFrame({ children }: PropsWithChildren) {
  const { theme } = useAppTheme();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        alignSelf: 'center',
        flex: 1,
        maxWidth: 430,
        width: '100%',
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xLarge,
          borderWidth: 1,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
