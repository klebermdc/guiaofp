import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WaitTimeData } from '@/types/parkMap';

export function useParkMapWaitTimes() {
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);

  const fetchWaitTimes = useCallback(async (parkId: string, isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isBackground) {
      setIsLoadingWaitTimes(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
      } else if (Array.isArray((data as any)?.data)) {
        setWaitTimes((data as any).data);
        setDataSource((data as any)?.source || 'unknown');
        setLastWaitTimeUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
    }

    if (!isBackground) {
      setIsLoadingWaitTimes(false);
    }
    isFetchingRef.current = false;
  }, []);

  return { waitTimes, dataSource, isLoadingWaitTimes, lastWaitTimeUpdate, fetchWaitTimes };
}
