import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColorToken, TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  children: ReactNode;
  color?: ThemeColorToken;
  style?: StyleProp<TextStyle>;
  variant?: TypographyVariant;
};

export function AppText({
  children,
  color = 'textPrimary',
  style,
  variant = 'body',
  ...props
}: AppTextProps) {
  const { theme } = useAppTheme();

  return (
    <Text
      allowFontScaling
      style={[
        styles.base,
        theme.typography[variant],
        { color: theme.colors[color] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
