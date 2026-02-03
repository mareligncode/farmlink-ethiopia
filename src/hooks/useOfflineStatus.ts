import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  products: any[];
  lastSynced: string | null;
}

const OFFLINE_STORAGE_KEY = 'agriconnect_offline_data';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data
    const cached = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (cached) {
      try {
        setOfflineData(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse offline data:', e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheProducts = useCallback((products: any[]) => {
    const data: OfflineData = {
      products,
      lastSynced: new Date().toISOString(),
    };
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
    setOfflineData(data);
  }, []);

  const getCachedProducts = useCallback(() => {
    return offlineData?.products || [];
  }, [offlineData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    setOfflineData(null);
  }, []);

  return {
    isOnline,
    offlineData,
    cacheProducts,
    getCachedProducts,
    clearCache,
    lastSynced: offlineData?.lastSynced ? new Date(offlineData.lastSynced) : null,
  };
};

export default useOfflineStatus;
