import { useState, useCallback, useEffect } from 'react';
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

// Hook for guides to manage any client's status
export const useGuideMultipassStatus = () => {
  const [statuses, setStatuses] = useState<MultipassStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('multipass_status')
        .select('*')
        .order('first_disney_park_date', { ascending: true });

      if (error) {
        console.error('Error loading all multipass statuses:', error);
      }

      setStatuses(data || []);
    } catch (err) {
      console.error('Error in loadAllStatuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllStatuses();
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

      await loadAllStatuses();
      return { success: true };
    } catch (error: any) {
      console.error('Error confirming client purchase:', error);
      return { success: false, error: error.message };
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

      await loadAllStatuses();
      return { success: true };
    } catch (error: any) {
      console.error('Error undoing client purchase:', error);
      return { success: false, error: error.message };
    }
  };

  const getStatusForUser = (userId: string) => {
    return statuses.find(s => s.user_id === userId) || null;
  };

  return {
    statuses,
    isLoading,
    confirmClientPurchase,
    undoClientPurchase,
    getStatusForUser,
    refetch: loadAllStatuses,
  };
};
