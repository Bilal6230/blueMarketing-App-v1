import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PropsWithChildren<
  PressableProps & {
    disabled?: boolean;
  }
>;

export function PressableScale({
  children,
  disabled,
  onBlur,
  onFocus,
  onPressIn,
  onPressOut,
  style,
  ...props
}: PressableScaleProps) {
  const { theme } = useAppTheme();
  const prefersReducedMotion = useReducedMotionPreference();
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onPressIn={(event) => {
        if (!prefersReducedMotion && !disabled) {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(0.98, theme.motion.springGentle);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!prefersReducedMotion && !disabled) {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(1, theme.motion.springResponsive);
        }
        onPressOut?.(event);
      }}
      style={(state: PressableStateCallbackType) => {
        const resolvedStyle =
          typeof style === 'function' ? style(state) : style;

        return [
          resolvedStyle,
          animatedStyle,
          isFocused
            ? {
                outlineColor: theme.colors.focusRing,
                outlineOffset: 2,
                outlineStyle: 'solid',
                outlineWidth: 2,
              }
            : null,
        ];
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
