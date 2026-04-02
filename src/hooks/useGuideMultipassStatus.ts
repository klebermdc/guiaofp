import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MultipassStatus {
  id: string;
  user_id: string;
  is_purchased: boolean;
  purchased_at: string | null;
  confirmed_by: string | null;
  first_disney_park_date: string | null;
  notification_start_date: string | null;
  last_notification_sent: string | null;
  last_notification_at: string | null;
  created_at: string;
  updated_at: string;
}

// Global cache for guide multipass statuses
let guideStatusCache: { data: MultipassStatus[]; timestamp: number } | null = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes - guides need more fresh data

// Hook for guides to manage any client's status
export const useGuideMultipassStatus = () => {
  const [statuses, setStatuses] = useState<MultipassStatus[]>(() => {
    // Initialize from cache if available
    if (guideStatusCache && Date.now() - guideStatusCache.timestamp < CACHE_TTL) {
      return guideStatusCache.data;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading
    if (guideStatusCache && Date.now() - guideStatusCache.timestamp < CACHE_TTL) {
      return false;
    }
    return true;
  });
  
  const isFetchedRef = useRef(false);

  const loadAllStatuses = useCallback(async (force = false) => {
    // Skip if we have valid cache and not forcing refresh
    if (!force && guideStatusCache && Date.now() - guideStatusCache.timestamp < CACHE_TTL) {
      if (isFetchedRef.current) return;
      setStatuses(guideStatusCache.data);
      setIsLoading(false);
      isFetchedRef.current = true;
      return;
    }

    try {
      const { data, error } = await supabase
        .from('multipass_status')
        .select('*')
        .order('first_disney_park_date', { ascending: true });

      if (error) {
        console.error('Error loading all multipass statuses:', error);
      }

      const statusData = data || [];
      setStatuses(statusData);
      // Update cache
      guideStatusCache = { data: statusData, timestamp: Date.now() };
      isFetchedRef.current = true;
    } catch (err) {
      console.error('Error in loadAllStatuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFetchedRef.current) {
      loadAllStatuses();
    }
  }, [loadAllStatuses]);

  const confirmClientPurchase = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('multipass_status')
        .upsert({
          user_id: userId,
          is_purchased: true,
          purchased_at: new Date().toISOString(),
          confirmed_by: 'guide',
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Invalidate cache and refetch
      guideStatusCache = null;
      isFetchedRef.current = false;
      await loadAllStatuses(true);
      return { success: true };
    } catch (error) {
      console.error('Error confirming client purchase:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const undoClientPurchase = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('multipass_status')
        .update({
          is_purchased: false,
          purchased_at: null,
          confirmed_by: null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache and refetch
      guideStatusCache = null;
      isFetchedRef.current = false;
      await loadAllStatuses(true);
      return { success: true };
    } catch (error) {
      console.error('Error undoing client purchase:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const getStatusForUser = (userId: string) => {
    return statuses.find(s => s.user_id === userId) || null;
  };

  // Force refresh function
  const refetch = useCallback(() => {
    guideStatusCache = null;
    isFetchedRef.current = false;
    return loadAllStatuses(true);
  }, [loadAllStatuses]);

  return {
    statuses,
    isLoading,
    confirmClientPurchase,
    undoClientPurchase,
    getStatusForUser,
    refetch,
  };
};
