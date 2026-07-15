import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
  loading?: boolean;
  scrollable?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({
  children,
  contentContainerStyle,
  keyboardAware = true,
  loading = false,
  scrollable = true,
  scrollProps,
  style,
  testID,
}: ScreenProps) {
  const { theme } = useAppTheme();
  const Container = keyboardAware ? KeyboardAvoidingView : View;
  const containerProps = keyboardAware
    ? {
        behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined,
      }
    : {};

  const body = scrollable ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, styles.content, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
        style,
      ]}
      testID={testID}
    >
      <Container style={styles.fill} {...containerProps}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
          </View>
        ) : null}
        {body}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
