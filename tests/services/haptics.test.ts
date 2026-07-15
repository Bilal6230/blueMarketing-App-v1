import * as Haptics from 'expo-haptics';

import {
  errorFeedback,
  lightImpactFeedback,
  selectionFeedback,
  successFeedback,
  warningFeedback,
} from '@/services/haptics';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Error: 'error',
    Success: 'success',
    Warning: 'warning',
  },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('haptics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes semantic haptic calls to Expo Haptics', async () => {
    await selectionFeedback();
    await lightImpactFeedback();
    await successFeedback();
    await warningFeedback();
    await errorFeedback();

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      1,
      Haptics.NotificationFeedbackType.Success,
    );
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      2,
      Haptics.NotificationFeedbackType.Warning,
    );
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      3,
      Haptics.NotificationFeedbackType.Error,
    );
  });

  it('fails silently when Expo Haptics rejects', async () => {
    jest
      .mocked(Haptics.selectionAsync)
      .mockRejectedValueOnce(new Error('unavailable'));

    await expect(selectionFeedback()).resolves.toBeUndefined();
  });
});
