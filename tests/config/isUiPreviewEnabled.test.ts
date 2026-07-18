const runtime = globalThis as typeof globalThis & { __DEV__?: boolean };

describe('isUiPreviewEnabled', () => {
  const originalDev = runtime.__DEV__;
  const originalEnvValue = process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW;

  afterEach(() => {
    runtime.__DEV__ = originalDev;

    if (originalEnvValue === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW = originalEnvValue;
    }

    jest.resetModules();
  });

  it('enables preview in development mode', () => {
    runtime.__DEV__ = true;
    delete process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW;

    jest.isolateModules(() => {
      const { isUiPreviewEnabled } = require('@/config/isUiPreviewEnabled');

      expect(isUiPreviewEnabled()).toBe(true);
    });
  });

  it('enables preview when EXPO_PUBLIC_ENABLE_UI_PREVIEW is true', () => {
    runtime.__DEV__ = false;
    process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW = 'true';

    jest.isolateModules(() => {
      const { isUiPreviewEnabled } = require('@/config/isUiPreviewEnabled');

      expect(isUiPreviewEnabled()).toBe(true);
    });
  });

  it('disables preview in production without the environment variable', () => {
    runtime.__DEV__ = false;
    delete process.env.EXPO_PUBLIC_ENABLE_UI_PREVIEW;

    jest.isolateModules(() => {
      const { isUiPreviewEnabled } = require('@/config/isUiPreviewEnabled');

      expect(isUiPreviewEnabled()).toBe(false);
    });
  });
});
