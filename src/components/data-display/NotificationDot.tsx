import { View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export function NotificationDot() {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.surface,
        borderRadius: 5,
        borderWidth: 2,
        height: 10,
        width: 10,
      }}
    />
  );
}
