import type { PropsWithChildren } from 'react';
import { Pressable, type PressableProps } from 'react-native';
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
  onPressIn,
  onPressOut,
  style,
  ...props
}: PressableScaleProps) {
  const { theme } = useAppTheme();
  const prefersReducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!prefersReducedMotion && !disabled) {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(0.98, theme.motion.springGentle);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!prefersReducedMotion) {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(1, theme.motion.springResponsive);
        }
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
