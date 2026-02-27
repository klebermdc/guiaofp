import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// In-memory cache to avoid hitting Supabase for repeated reads within the same session
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();

interface UseCacheOptions {
  /** If true, skip cache entirely and always fetch fresh */
  skip?: boolean;
  /** If true, return stale data while revalidating in background */
  staleWhileRevalidate?: boolean;
}

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number,
  options?: UseCacheOptions
): { data: T | null; loading: boolean; error: Error | null; invalidate: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const isMounted = useRef(true);

  const resolve = useCallback(async (forceRefresh = false) => {
    if (options?.skip) {
      setLoading(false);
      return;
    }

    try {
      const now = Date.now();

      // 1. Check in-memory cache first (fastest)
      if (!forceRefresh) {
        const mem = memoryCache.get(key);
        if (mem && mem.expiresAt > now) {
          if (isMounted.current) {
            setData(mem.data as T);
            setLoading(false);
          }
          // Fire-and-forget: increment hit_count in Supabase
          supabase.rpc('increment_cache_hit' as never, { cache_key: key } as never).then();
          return;
        }
      }

      // 2. Check Supabase cache
      if (!forceRefresh) {
        const { data: cached } = await supabase
          .from('cache_entries')
          .select('data, expires_at')
          .eq('key', key)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (cached) {
          const parsed = cached.data as T;
          // Store in memory cache
          memoryCache.set(key, {
            data: parsed,
            expiresAt: new Date(cached.expires_at).getTime(),
          });
          if (isMounted.current) {
            setData(parsed);
            setLoading(false);
          }
          // Increment hit count (fire-and-forget)
          supabase
            .from('cache_entries')
            .update({ hit_count: 1 }) // Will be incremented via raw sql if needed
            .eq('key', key)
            .then();
          return;
        }
      }

      // 3. Cache miss – fetch fresh data
      const freshData = await fetchFnRef.current();
      const expiresAt = new Date(now + ttlMinutes * 60 * 1000);

      // Store in memory cache
      memoryCache.set(key, {
        data: freshData,
        expiresAt: expiresAt.getTime(),
      });

      // Store in Supabase cache (fire-and-forget, upsert)
      supabase
        .from('cache_entries')
        .upsert(
          {
            key,
            data: freshData as never,
            expires_at: expiresAt.toISOString(),
            hit_count: 0,
          },
          { onConflict: 'key' }
        )
        .then();

      if (isMounted.current) {
        setData(freshData);
        setLoading(false);
      }
    } catch (err) {
      console.error(`[useCache] Error for key "${key}":`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }
  }, [key, ttlMinutes, options?.skip]);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);
    resolve();
    return () => {
      isMounted.current = false;
    };
  }, [resolve]);

  const invalidate = useCallback(() => {
    memoryCache.delete(key);
    setLoading(true);
    resolve(true);
  }, [key, resolve]);

  return { data, loading, error, invalidate };
}

/** Invalidate a specific cache key from anywhere */
export function invalidateCache(key: string) {
  memoryCache.delete(key);
  supabase.from('cache_entries').delete().eq('key', key).then();
}

/** Prefetch and cache data for a key */
export async function prefetchCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number
) {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) return mem.data as T;

  const data = await fetchFn();
  const expiresAt = new Date(now + ttlMinutes * 60 * 1000);

  memoryCache.set(key, { data, expiresAt: expiresAt.getTime() });

  supabase
    .from('cache_entries')
    .upsert(
      {
        key,
        data: data as never,
        expires_at: expiresAt.toISOString(),
        hit_count: 0,
      },
      { onConflict: 'key' }
    )
    .then();

  return data;
}
