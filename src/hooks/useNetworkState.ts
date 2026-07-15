import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const nextOnline = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      setIsOnline(nextOnline);
      onlineManager.setOnline(nextOnline);
    });

    return unsubscribe;
  }, []);

  return { isOnline };
}
