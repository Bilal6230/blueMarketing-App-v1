export function isUiPreviewEnabled() {
  return __DEV__ || process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW === 'true';
}
