import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';

type FadeInViewProps = PropsWithChildren<{
  delay?: number;
  translateY?: number;
}>;

export function FadeInView({
  children,
  delay = 0,
  translateY = 12,
}: FadeInViewProps) {
  const { theme } = useAppTheme();
  const prefersReducedMotion = useReducedMotionPreference();
  const progress = useSharedValue(prefersReducedMotion ? 1 : 0);

  useEffect(() => {
    progress.value = prefersReducedMotion
      ? 1
      : withDelay(
          delay,
          withTiming(1, {
            duration: theme.motion.durationSlow,
            easing: Easing.bezier(...theme.motion.easeStandard),
          }),
        );
  }, [delay, prefersReducedMotion, progress, theme.motion]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: prefersReducedMotion
          ? 0
          : (1 - progress.value) * translateY,
      },
    ],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
