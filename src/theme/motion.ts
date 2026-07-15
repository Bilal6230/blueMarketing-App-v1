import type { MotionScale } from '@/theme/types';

export const motion: MotionScale = {
  durationFast: 120,
  durationInstant: 90,
  durationNormal: 200,
  durationSlow: 280,
  easeEmphasized: [0.2, 0, 0, 1],
  easeStandard: [0.22, 1, 0.36, 1],
  springGentle: {
    damping: 18,
    mass: 0.9,
    stiffness: 170,
  },
  springResponsive: {
    damping: 15,
    mass: 0.8,
    stiffness: 220,
  },
};
