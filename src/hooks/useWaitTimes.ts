/**
 * useWaitTimes Hook
 * 
 * Manages wait time data fetching, auto-refresh, and matching logic for park attractions.
 * Extracted from ParkMap.tsx for reusability and maintainability.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { REFRESH_INTERVALS } from '@/data/constants';

export interface WaitTimeData {
  id: number | string;
  name: string;
  isOpen: boolean;
  waitTime: number;
  lastUpdated: string;
}

// Normalize attraction names for matching with wait times
export const normalizeAttractionName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\\w\\s']/g, '')
    .replace(/\\s+/g, ' ')
    .trim();
};

// Find matching wait time for an attraction
export const findWaitTime = (attractionName: string, waitTimes: WaitTimeData[]): WaitTimeData | undefined => {
  const normalizedName = normalizeAttractionName(attractionName);
  
  return waitTimes.find(wt => {
    const normalizedWtName = normalizeAttractionName(wt.name);
    return normalizedName === normalizedWtName || 
           normalizedName.includes(normalizedWtName) || 
           normalizedWtName.includes(normalizedName);
  });
};

// Get wait time badge color based on wait duration
export const getWaitTimeColor = (waitTime: number | undefined): string => {
  if (waitTime === undefined) return 'bg-muted text-muted-foreground';
  if (waitTime > 60) return 'bg-red-500 text-white';
  if (waitTime > 30) return 'bg-amber-500 text-white';
  return 'bg-green-500 text-white';
};

interface UseWaitTimesOptions {
  parkId: string;
  isMobile: boolean;
  enabled?: boolean;
}

interface UseWaitTimesReturn {
  waitTimes: WaitTimeData[];
  isLoading: boolean;
  dataSource: string;
  lastUpdate: Date | null;
  refresh: () => void;
}

export function useWaitTimes({ parkId, isMobile, enabled = true }: UseWaitTimesOptions): UseWaitTimesReturn {
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Ref to track if a fetch is in progress (prevents overlapping requests)
  const isFetchingRef = useRef(false);

  // Fetch wait times from API - optimized for frequent updates
  const fetchWaitTimes = useCallback(async (isBackground = false) => {
    if (!enabled) return;
    
    // Prevent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    // Only show loading indicator on initial load, not background updates
    if (!isBackground) {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
        // Don't clear wait times on error - keep showing last known data
      } else if (Array.isArray((data as any)?.data)) {
        // Some deployments return { data: Ride[] } without a success flag.
        setWaitTimes((data as any).data);
        setDataSource((data as any)?.source || 'unknown');
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
      // Don't clear wait times on error - keep showing last known data
    }
    
    if (!isBackground) {
      setIsLoading(false);
    }
    isFetchingRef.current = false;
  }, [parkId, enabled]);

  // Initial fetch when park changes
  useEffect(() => {
    if (enabled) {
      fetchWaitTimes(false);
    }
  }, [parkId, enabled, fetchWaitTimes]);

  // Auto-refresh wait times - 15 seconds for desktop (planning mode), 30 seconds for mobile (battery saving)
  useEffect(() => {
    if (!enabled) return;
    
    const refreshInterval = isMobile 
      ? REFRESH_INTERVALS.waitTimes.mobile 
      : REFRESH_INTERVALS.waitTimes.desktop;
      
    const interval = setInterval(() => {
      fetchWaitTimes(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [parkId, fetchWaitTimes, isMobile, enabled]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchWaitTimes(false);
  }, [fetchWaitTimes]);

  return {
    waitTimes,
    isLoading,
    dataSource,
    lastUpdate,
    refresh,
  };
}
