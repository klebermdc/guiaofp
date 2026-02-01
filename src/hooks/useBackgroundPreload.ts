import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global caches with TTL
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const preloadedTables = new Set<string>();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface PreloadConfig {
  table: string;
  select?: string;
  filter?: Record<string, string>;
  orderColumn?: string;
  ascending?: boolean;
}

/**
 * Background preload hook - fetches data silently in the background
 * without showing loading states to the user
 */
export function useBackgroundPreload(configs: PreloadConfig[], userId?: string) {
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;

    // Use requestIdleCallback for non-blocking background fetching
    const preload = async () => {
      for (const config of configs) {
        const cacheKey = `${config.table}:${userId || 'global'}`;
        
        // Skip if already cached and fresh
        const cached = dataCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          continue;
        }

        // Skip if already preloading
        if (preloadedTables.has(cacheKey)) continue;
        preloadedTables.add(cacheKey);

        try {
          // Build query dynamically using raw SQL approach for flexibility
          const { data } = await supabase
            .from(config.table as 'restaurants')
            .select(config.select || '*');
          
          if (data) {
            dataCache.set(cacheKey, { data, timestamp: Date.now() });
          }
        } catch {
          // Silent fail - background preload should not affect UX
        } finally {
          preloadedTables.delete(cacheKey);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      (window as Window).requestIdleCallback(() => preload(), { timeout: 2000 });
    } else {
      setTimeout(preload, 100);
    }
  }, [configs, userId]);
}

/**
 * Get cached data synchronously
 */
export function getCachedData<T>(table: string, userId?: string): T | null {
  const cacheKey = `${table}:${userId || 'global'}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  
  return null;
}

/**
 * Invalidate cache for a specific table
 */
export function invalidateCache(table: string, userId?: string) {
  const cacheKey = `${table}:${userId || 'global'}`;
  dataCache.delete(cacheKey);
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  dataCache.clear();
  preloadedTables.clear();
}
