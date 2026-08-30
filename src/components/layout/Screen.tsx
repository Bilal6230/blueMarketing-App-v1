import type { PropsWithChildren, Ref } from 'react';
import {
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

import { MobilePreviewFrame } from '@/components/layout/MobilePreviewFrame';
import { useAppTheme } from '@/hooks/useAppTheme';

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  scrollViewRef?: Ref<ScrollView>;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({
  children,
  contentContainerStyle,
  keyboardAware = true,
  scrollProps,
  scrollViewRef,
  scrollable = true,
  style,
  testID,
}: ScreenProps) {
  const { theme } = useAppTheme();
  const Container = keyboardAware ? KeyboardAvoidingView : View;
  const content = scrollable ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingTop: theme.spacing.screenTop,
        },
        contentContainerStyle,
      ]}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingTop: theme.spacing.screenTop,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      testID={testID}
    >
      <MobilePreviewFrame>
        <Container
          behavior={
            keyboardAware
              ? Platform.OS === 'ios'
                ? 'padding'
                : 'height'
              : undefined
          }
          style={styles.safeArea}
        >
          {content}
        </Container>
      </MobilePreviewFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: 24,
    paddingBottom: 28,
  },
  safeArea: {
    flex: 1,
  },
});
