import type { ElevationScale } from '@/theme/types';

export const elevation: ElevationScale = {
  card: {
    elevation: 3,
    shadowColor: '#071426',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  floating: {
    elevation: 5,
    shadowColor: '#071426',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  overlay: {
    elevation: 8,
    shadowColor: '#071426',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
  },
};
