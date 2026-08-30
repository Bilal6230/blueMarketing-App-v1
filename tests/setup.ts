import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-reanimated', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: {
      View: require('react-native').View,
      createAnimatedComponent: (Component: React.ComponentType) => Component,
    },
    Easing: {
      bezier: () => undefined,
    },
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withDelay: (_delay: number, value: number) => value,
    withSpring: jest.fn((value: number) => value),
    withTiming: (value: number) => value,
  };
});

process.env.EXPO_PUBLIC_API_BASE_URL = 'http://127.0.0.1/api/v1/mobile';
