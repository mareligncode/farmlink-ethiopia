import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealtimeOrdersOptions {
  enabled?: boolean;
  orderId?: string;
  pollInterval?: number;
}

export const useRealtimeOrders = ({ 
  enabled = true, 
  orderId, 
  pollInterval = 10000 
}: UseRealtimeOrdersOptions = {}) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDataRef = useRef<string>('');

  const checkForUpdates = useCallback(async () => {
    if (!profile) return;

    try {
      if (orderId) {
        // Check single order
        const response = await ordersAPI.getById(orderId);
        const newData = JSON.stringify(response.data);
        
        if (lastDataRef.current && lastDataRef.current !== newData) {
          // Data changed, invalidate queries
          queryClient.invalidateQueries({ queryKey: ['order', orderId] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
        lastDataRef.current = newData;
      } else {
        // Check all orders
        const response = await ordersAPI.getAll();
        const newData = JSON.stringify(response.data);
        
        if (lastDataRef.current && lastDataRef.current !== newData) {
          // Data changed, invalidate queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
        lastDataRef.current = newData;
      }
    } catch (error) {
      console.error('Error checking for order updates:', error);
    }
  }, [orderId, profile, queryClient]);

  useEffect(() => {
    if (!enabled || !profile) return;

    // Start polling
    intervalRef.current = setInterval(checkForUpdates, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, profile, pollInterval, checkForUpdates]);

  // Manual refresh function
  const refresh = useCallback(() => {
    lastDataRef.current = '';
    checkForUpdates();
  }, [checkForUpdates]);

  return { refresh };
};

export default useRealtimeOrders;
