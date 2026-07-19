import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import {
  AppButton,
  AppCard,
  AppText,
  BrandLockup,
  InlineMessage,
  PasswordInput,
  Screen,
} from '@/components';
import { AppInput } from '@/components/controls/AppInput';
import { signInWithMockCredentials } from '@/features/auth/services/mockAuthService';
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

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await signInWithMockCredentials(values);
      const result = await setSession(session);

      if (!result.ok) {
        setError('root', {
          message: 'Unable to start your session right now.',
        });
        return;
      }

      router.replace('/(app)');
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Incorrect email or password',
      });
    }
  });

  return (
    <Screen contentContainerStyle={styles.screen} testID={testIds.loginScreen}>
      <View style={styles.spacer} />
      <AppCard padding="lg" surface="elevated">
        <BrandLockup subtitle="Operations workspace" />
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
              onSubmitEditing={onSubmit}
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
              autoCorrect={false}
              errorText={errors.password?.message}
              label="Password"
              leadingIcon="lock-closed-outline"
              onBlur={onBlur}
              onChangeText={onChange}
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
        <AppButton
          loading={isSubmitting}
          onPress={() => void onSubmit()}
          testID={testIds.signInButton}
          title="Sign in"
          variant="primary"
        />
      </AppCard>
      <View style={styles.bottomSpace} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomSpace: {
    flex: 0.7,
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
