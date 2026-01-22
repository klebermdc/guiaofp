import { useState, useEffect, useCallback } from 'react';
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

export const useMultipassStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MultipassStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setIsLoading(false);
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

      await loadStatus();
      return { success: true };
    } catch (error: any) {
      console.error('Error confirming purchase:', error);
      return { success: false, error: error.message };
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

      await loadStatus();
      return { success: true };
    } catch (error: any) {
      console.error('Error undoing purchase:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    status,
    isLoading,
    confirmPurchase,
    undoPurchase,
    refetch: loadStatus,
  };
};
