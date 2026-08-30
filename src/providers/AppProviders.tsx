import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { useNetworkState } from '@/hooks/useNetworkState';
import { queryClient, QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider, useThemeContext } from '@/providers/ThemeProvider';
import { logger } from '@/services/logger';
import { resolveActiveAccessToken } from '@/store/resolveActiveAccessToken';
import { useAuthStore } from '@/store/authStore';
import type { AuthStatus } from '@/store/types';
import {
  registerTokenProvider,
  registerUnauthorizedHandler,
} from '@/api/tokenProvider';

export function AuthSessionEffects() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const previousStatusRef = useRef<AuthStatus>(status);

  useEffect(() => {
    registerTokenProvider(() => resolveActiveAccessToken(status, accessToken));
  }, [accessToken, status]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logger.info('Received unauthorized API response.', {
        source: 'apiClient',
      });

      return useAuthStore.getState().clearSession().then(() => undefined);
    });
  }, []);

  useEffect(() => {
    if (
      status === 'unauthenticated' &&
      previousStatusRef.current !== 'unauthenticated'
    ) {
      queryClient.clear();
    }

    previousStatusRef.current = status;
  }, [status]);

  return null;
}

function BootstrapGate({ children }: PropsWithChildren) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useAppLifecycle();
  useNetworkState();

  useEffect(() => {
    if (!fontError) {
      return;
    }

    logger.warn(
      'Custom fonts failed to load. Falling back to system rendering.',
      {
        family: 'Manrope',
        reason: fontError instanceof Error ? fontError.name : 'unknown',
        source: 'fontLoader',
      },
    );
  }, [fontError]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await hydrateSession();
      } finally {
        if (!mounted || (!fontsLoaded && !fontError)) {
          return;
        }

        setReady(true);
        await SplashScreen.hideAsync();
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [fontError, fontsLoaded, hydrateSession]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}

function ProviderStatusBar() {
  useThemeContext();
  return <StatusBar style="dark" />;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <AuthSessionEffects />
          <BootstrapGate>
            <ProviderStatusBar />
            {children}
          </BootstrapGate>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
