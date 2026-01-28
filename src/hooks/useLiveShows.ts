import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveShow {
  id: string;
  name: string;
  entityType: 'SHOW' | 'CHARACTER';
  status: string;
  showtimes: string[];
  nextShowtime?: string;
  lastUpdated: string;
}

interface UseLiveShowsResult {
  shows: LiveShow[];
  isLoading: boolean;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

export function useLiveShows(parkId: string, refreshInterval = 60000): UseLiveShowsResult {
  const [shows, setShows] = useState<LiveShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);

  const fetchShows = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current || !parkId) return;
    isFetchingRef.current = true;
    
    if (!isBackground) {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching shows:', error);
      } else if (Array.isArray(data?.shows)) {
        setShows(data.shows);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch shows:', err);
    }
    
    if (!isBackground) {
      setIsLoading(false);
    }
    isFetchingRef.current = false;
  }, [parkId]);

  // Initial fetch
  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchShows(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchShows, refreshInterval]);

  return {
    shows,
    isLoading,
    lastUpdate,
    refetch: () => fetchShows(false),
  };
}
