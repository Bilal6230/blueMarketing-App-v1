import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

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

type PremiumLoginScreenProps = {
  previewMode?: boolean;
};

export function PremiumLoginScreen({
  previewMode = false,
}: PremiumLoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

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
            onPress={async () => {
              await lightImpactFeedback();
              setLoading(true);
              setTimeout(() => setLoading(false), 900);
            }}
            title="Sign in"
            variant="primary"
          />
          <AppDivider />
          <AppText color="textMuted" variant="caption">
            Secure device-level storage and session validation will be connected
            in a later sprint.
          </AppText>
          <Pressable
            accessibilityHint="Prototype help link"
            accessibilityLabel="Open support placeholder"
            accessibilityRole="link"
            onPress={() => Linking.openURL('https://example.com/support')}
          >
            <AppText color="primary" variant="labelStrong">
              Need help accessing Blue Marketing?
            </AppText>
          </Pressable>
          {previewMode ? (
            <InlineMessage
              message="No credentials are stored, and no real authentication request is sent in this sprint."
              title="Preview interaction only"
              tone="information"
            />
          ) : null}
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
