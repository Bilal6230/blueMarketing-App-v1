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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { MobilePreviewFrame } from '@/components/layout/MobilePreviewFrame';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import type { BottomNavigationRoute } from '@/components/navigation/BottomNavigationItem';
import { useAppTheme } from '@/hooks/useAppTheme';

const TAB_BAR_RESERVED_SPACE = 112;

type AppTabScaffoldProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  items: BottomNavigationRoute[];
  keyboardAware?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  scrollable?: boolean;
  selectedKey: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function AppTabScaffold({
  children,
  contentContainerStyle,
  items,
  keyboardAware = true,
  scrollProps,
  scrollable = true,
  selectedKey,
  style,
  testID,
}: AppTabScaffoldProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const Container = keyboardAware ? KeyboardAvoidingView : View;
  const bottomPadding = TAB_BAR_RESERVED_SPACE + Math.max(insets.bottom, 12);

  const content = scrollable ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: bottomPadding,
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
        styles.staticContent,
        {
          paddingBottom: bottomPadding,
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
      edges={['top', 'left', 'right']}
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
          <View style={styles.safeArea}>
            <View style={styles.contentArea}>{content}</View>
            <View
              style={[
                styles.navigationArea,
                {
                  backgroundColor: theme.colors.background,
                  paddingBottom: Math.max(insets.bottom, 12),
                  paddingHorizontal: theme.spacing.screenHorizontal,
                },
              ]}
            >
              <BottomNavigation items={items} selectedKey={selectedKey} />
            </View>
          </View>
        </Container>
      </MobilePreviewFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: 24,
  },
  contentArea: {
    flex: 1,
    minHeight: 0,
  },
  navigationArea: {
    paddingTop: 12,
  },
  safeArea: {
    flex: 1,
  },
  staticContent: {
    flex: 1,
  },
});
