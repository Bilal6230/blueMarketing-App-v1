import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
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
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider, useThemeContext } from '@/providers/ThemeProvider';
import { logger } from '@/services/logger';
import { resolveActiveAccessToken } from '@/store/resolveActiveAccessToken';
import { useAuthStore } from '@/store/authStore';
import {
  registerTokenProvider,
  registerUnauthorizedHandler,
} from '@/api/tokenProvider';

function BootstrapGate({ children }: PropsWithChildren) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useAppLifecycle();
  useNetworkState();

  useEffect(() => {
    registerTokenProvider(() => resolveActiveAccessToken(status, accessToken));
  }, [accessToken, status]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logger.info('Received unauthorized API response.', {
        source: 'apiClient',
      });
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await hydrateSession();
      } finally {
        if (!mounted || !fontsLoaded) {
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
  }, [fontsLoaded, hydrateSession]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}

function ProviderStatusBar() {
  const { colorScheme } = useThemeContext();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <BootstrapGate>
            <ProviderStatusBar />
            {children}
          </BootstrapGate>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
