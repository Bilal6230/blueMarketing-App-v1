import { View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type AppDividerProps = {
  strong?: boolean;
};

export function AppDivider({ strong = false }: AppDividerProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        backgroundColor: strong
          ? theme.component.divider.strong
          : theme.component.divider.default,
        height: 1,
        width: '100%',
      }}
    />
  );
}
