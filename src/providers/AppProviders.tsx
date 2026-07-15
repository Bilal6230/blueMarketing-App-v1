import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { useNetworkState } from '@/hooks/useNetworkState';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider, useThemeContext } from '@/providers/ThemeProvider';
import { logger } from '@/services/logger';
import { useAuthStore } from '@/store/authStore';
import { registerTokenProvider, registerUnauthorizedHandler } from '@/api/tokenProvider';

function BootstrapGate({ children }: PropsWithChildren) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [ready, setReady] = useState(false);

  useAppLifecycle();
  useNetworkState();

  useEffect(() => {
    registerTokenProvider(() => accessToken);
  }, [accessToken]);

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
        if (!mounted) {
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
  }, [hydrateSession]);

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
