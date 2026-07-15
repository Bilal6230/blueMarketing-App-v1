import { View } from 'react-native';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type AvatarProps = {
  initials: string;
  size?: number;
};

export function Avatar({ initials, size = 40 }: AvatarProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={`Avatar ${initials}`}
      accessibilityRole="image"
      style={{
        alignItems: 'center',
        backgroundColor: theme.component.avatar.background,
        borderRadius: size / 2,
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <AppText
        style={{ color: theme.component.avatar.foreground }}
        variant="labelStrong"
      >
        {initials}
      </AppText>
    </View>
  );
}
