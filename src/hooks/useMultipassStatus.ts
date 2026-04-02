import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

// Cache for multipass status per user
const statusCache = new Map<string, { status: MultipassStatus | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMultipassStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MultipassStatus | null>(() => {
    // Initialize from cache if available
    if (user?.id) {
      const cached = statusCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.status;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading
    if (user?.id) {
      const cached = statusCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return false;
      }
    }
    return true;
  });
  
  const fetchedUserIdRef = useRef<string | null>(null);

  const loadStatus = useCallback(async (force = false) => {
    if (!user) {
      setStatus(null);
      setIsLoading(false);
      fetchedUserIdRef.current = null;
      return;
    }

    // Skip if we have valid cache and not forcing refresh
    const cached = statusCache.get(user.id);
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (fetchedUserIdRef.current === user.id) {
        return; // Already fetched, skip
      }
      setStatus(cached.status);
      setIsLoading(false);
      fetchedUserIdRef.current = user.id;
      return;
    }

    // Don't refetch if we already fetched for this exact user
    if (!force && fetchedUserIdRef.current === user.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('multipass_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading multipass status:', error);
      }

      setStatus(data);
      // Update cache
      statusCache.set(user.id, { status: data, timestamp: Date.now() });
      fetchedUserIdRef.current = user.id;
    } catch (err) {
      console.error('Error in loadStatus:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const confirmPurchase = async (confirmedBy: 'client' | 'guide' = 'client') => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('multipass_status')
        .upsert({
          user_id: user.id,
          is_purchased: true,
          purchased_at: new Date().toISOString(),
          confirmed_by: confirmedBy,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Trigger WhatsApp notification for confirmed purchase (fire-and-forget)
      supabase.functions.invoke('send-whatsapp', {
        body: {
          user_id: user.id,
          template: 'multipass_purchased',
          template_data: {
            date: new Date().toLocaleDateString('pt-BR'),
          },
        },
      }).catch(err => console.error('WhatsApp notification failed:', err));

      // Invalidate cache and refetch
      statusCache.delete(user.id);
      fetchedUserIdRef.current = null;
      await loadStatus(true);
      return { success: true };
    } catch (error) {
      console.error('Error confirming purchase:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const undoPurchase = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('multipass_status')
        .update({
          is_purchased: false,
          purchased_at: null,
          confirmed_by: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate cache and refetch
      statusCache.delete(user.id);
      fetchedUserIdRef.current = null;
      await loadStatus(true);
      return { success: true };
    } catch (error) {
      console.error('Error undoing purchase:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  // Force refresh function
  const refetch = useCallback(() => {
    if (user?.id) {
      statusCache.delete(user.id);
      fetchedUserIdRef.current = null;
    }
    return loadStatus(true);
  }, [user?.id, loadStatus]);

  return {
    status,
    isLoading,
    confirmPurchase,
    undoPurchase,
    refetch,
  };
};
