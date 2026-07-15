import type { PropsWithChildren } from 'react';
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
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({
  children,
  contentContainerStyle,
  keyboardAware = true,
  scrollProps,
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
      keyboardShouldPersistTaps="handled"
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
            Platform.OS === 'ios' && keyboardAware ? 'padding' : undefined
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
