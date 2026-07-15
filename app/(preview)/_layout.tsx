import { Redirect, Stack } from 'expo-router';

export default function PreviewLayout() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
