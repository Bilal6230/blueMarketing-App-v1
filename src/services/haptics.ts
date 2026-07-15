import * as Haptics from 'expo-haptics';

async function safelyRunHaptic(action: () => Promise<void>) {
  try {
    await action();
  } catch {
    return;
  }
}

export async function selectionFeedback() {
  await safelyRunHaptic(() => Haptics.selectionAsync());
}

export async function lightImpactFeedback() {
  await safelyRunHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  );
}

export async function successFeedback() {
  await safelyRunHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export async function warningFeedback() {
  await safelyRunHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}

export async function errorFeedback() {
  await safelyRunHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}
