import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import {
  AppCard,
  AppText,
  BrandLockup,
  InlineMessage,
  PasswordInput,
  Screen,
} from '@/components';
import { AppInput } from '@/components/controls/AppInput';
import { signIn } from '@/features/auth/services/authService';
import { resolveLoginErrorState } from '@/features/auth/utils/loginError';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/authStore';
import { testIds } from '@/utils/testIds';

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function PremiumLoginScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const passwordRef = useRef<TextInput | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);

      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          animated: true,
          y: 0,
        });
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await signIn(values);
      const result = await setSession(session);

      if (!result.ok) {
        setError('root', {
          message: 'Unable to start your session right now.',
        });
        return;
      }

      router.replace('/(app)');
    } catch (error) {
      const mappedErrorState = resolveLoginErrorState(error);

      if (mappedErrorState.emailMessage) {
        setError('email', { message: mappedErrorState.emailMessage });
      }

      if (mappedErrorState.passwordMessage) {
        setError('password', { message: mappedErrorState.passwordMessage });
      }

      if (!mappedErrorState.emailMessage && !mappedErrorState.passwordMessage) {
        setError('root', {
          message: mappedErrorState.rootMessage ?? 'Invalid email or password.',
        });
      }
    }
  });

  return (
    <Screen
      contentContainerStyle={[
        styles.screen,
        isKeyboardVisible
          ? styles.screenKeyboardOpen
          : styles.screenKeyboardClosed,
      ]}
      scrollProps={{
        keyboardDismissMode: 'on-drag',
        keyboardShouldPersistTaps: 'handled',
      }}
      scrollViewRef={scrollViewRef}
      testID={testIds.loginScreen}
    >
      <View style={styles.formArea}>
        <AppCard padding="lg" surface="elevated">
          <BrandLockup subtitle="Blue Marketing" />
          <View style={styles.copy}>
            <AppText variant="displayMedium">Welcome back</AppText>
            <AppText color="textSecondary" variant="bodyLarge">
              Sign in to manage your daily operations and team activity.
            </AppText>
          </View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                autoCapitalize="none"
                autoCorrect={false}
                errorText={errors.email?.message}
                keyboardType="email-address"
                label="Email"
                leadingIcon="mail-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder="name@bluemarketing.com"
                returnKeyType="next"
                testID={testIds.emailInput}
                textContentType="emailAddress"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onBlur, onChange, value } }) => (
              <PasswordInput
                ref={passwordRef}
                autoCorrect={false}
                errorText={errors.password?.message}
                label="Password"
                leadingIcon="lock-closed-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                onSubmitEditing={onSubmit}
                placeholder="Enter password"
                returnKeyType="done"
                testID={testIds.passwordInput}
                textContentType="password"
                value={value}
              />
            )}
          />
          {errors.root?.message ? (
            <View testID={testIds.authErrorMessage}>
              <InlineMessage
                message={errors.root.message}
                title="Sign-in failed"
                tone="danger"
              />
            </View>
          ) : null}
          <Pressable
            accessibilityLabel="Sign in"
            accessibilityRole="button"
            accessibilityState={{
              busy: isSubmitting,
              disabled: isSubmitting,
            }}
            disabled={isSubmitting}
            onPress={() => void onSubmit()}
            style={({ pressed }) => [
              styles.signInButton,
              {
                backgroundColor: isSubmitting
                  ? theme.component.button.variants.primary.backgroundDisabled
                  : pressed
                    ? theme.component.button.variants.primary.backgroundPressed
                    : theme.component.button.variants.primary.background,
                opacity: isSubmitting ? 0.75 : 1,
              },
            ]}
            testID={testIds.signInButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <AppText style={styles.signInButtonText} variant="labelStrong">
                Sign in
              </AppText>
            )}
          </Pressable>
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: 6,
  },
  formArea: {
    alignSelf: 'center',
    maxWidth: 460,
    paddingBottom: 24,
    width: '100%',
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  screenKeyboardClosed: {
    justifyContent: 'center',
  },
  screenKeyboardOpen: {
    justifyContent: 'flex-start',
    paddingBottom: 96,
    paddingTop: 8,
  },
  signInButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  signInButtonText: {
    color: '#FFFFFF',
  },
});
