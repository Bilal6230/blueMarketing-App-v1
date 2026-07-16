import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppDivider,
  AppSwitch,
  AppText,
  BrandLockup,
  InlineMessage,
  PasswordInput,
  Screen,
} from '@/components';
import { AppInput } from '@/components/controls/AppInput';
import { FadeInView } from '@/motion';
import { lightImpactFeedback } from '@/services/haptics';
import { testIds } from '@/utils/testIds';

type PremiumLoginMode = 'foundation' | 'preview';

type PremiumLoginScreenProps = {
  mode?: PremiumLoginMode;
};

export function PremiumLoginScreen({
  mode = 'foundation',
}: PremiumLoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPreviewMode = mode === 'preview';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePreviewPress = async () => {
    await lightImpactFeedback();
    setNotice(null);
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setNotice(
        'No request was sent. This preview demonstrates the loading state only.',
      );
    }, 900);
  };

  return (
    <Screen contentContainerStyle={styles.screen} testID={testIds.loginScreen}>
      <View style={styles.spacer} />
      <FadeInView>
        <AppCard padding="lg" surface="elevated">
          <BrandLockup subtitle="Blue Intelligence" />
          <View style={styles.copy}>
            <AppText variant="displayMedium">
              Mobile operations, simplified.
            </AppText>
            <AppText color="textSecondary" variant="bodyLarge">
              Secure access for authorised team members.
            </AppText>
          </View>
          <AppInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            leadingIcon="mail-outline"
            placeholder="bilal@bluemarketing.com"
          />
          <PasswordInput
            label="Password"
            leadingIcon="lock-closed-outline"
            placeholder="Enter password"
          />
          <AppSwitch
            hint="Visual prototype only. This setting is not yet functional."
            label="Remember this device"
            onValueChange={setRemember}
            value={remember}
          />
          <AppButton
            loading={loading}
            disabled={!isPreviewMode}
            onPress={
              isPreviewMode ? () => void handlePreviewPress() : undefined
            }
            testID="login-sign-in-button"
            title="Sign in"
            variant="primary"
          />
          {isPreviewMode ? (
            <InlineMessage
              message={
                notice ??
                'Preview mode may show loading, but it never stores credentials or sends an authentication request.'
              }
              title="Preview interaction only"
              tone="information"
            />
          ) : (
            <InlineMessage
              message="Authentication integration is not connected in this foundation route yet."
              title="Foundation layout only"
              tone="warning"
            />
          )}
          <AppDivider />
          <AppText color="textMuted" variant="caption">
            Secure device-level storage and session validation will be connected
            in a later sprint.
          </AppText>
        </AppCard>
      </FadeInView>
      <View style={styles.bottomSpace} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomSpace: {
    flex: 0.8,
  },
  copy: {
    gap: 6,
  },
  screen: {
    justifyContent: 'center',
  },
  spacer: {
    flex: 0.5,
  },
});
