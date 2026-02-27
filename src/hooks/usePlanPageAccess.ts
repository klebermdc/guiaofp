import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PageAccess {
  id: string;
  page_key: string;
  page_name: string;
  page_icon: string;
  basic_visible: boolean;
  premium_visible: boolean;
  travel_mode_visible: boolean;
  show_in_bottom_nav: boolean;
  sort_order: number;
  mobile_sort_order: number;
  desktop_sort_order: number;
  travel_mode_sort_order: number;
}

export type SortContext = 'mobile' | 'desktop' | 'travel_mode';

// Global cache for page access data
let pageAccessCache: { data: PageAccess[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - this data rarely changes

export function usePlanPageAccess() {
  const { isAuthenticated } = useAuth();
  const [pageAccess, setPageAccess] = useState<PageAccess[]>(() => {
    // Initialize from cache if available
    if (pageAccessCache && Date.now() - pageAccessCache.timestamp < CACHE_TTL) {
      return pageAccessCache.data;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading
    if (pageAccessCache && Date.now() - pageAccessCache.timestamp < CACHE_TTL) {
      return false;
    }
    return true;
  });
  const isFetched = useRef(false);

  const fetchPageAccess = useCallback(async (force = false) => {
    // Skip if we have valid cache and not forcing refresh
    if (!force && pageAccessCache && Date.now() - pageAccessCache.timestamp < CACHE_TTL && pageAccessCache.data.length > 0) {
      if (isFetched.current) return;
      setPageAccess(pageAccessCache.data);
      setIsLoading(false);
      isFetched.current = true;
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("plan_page_access")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setPageAccess(data as PageAccess[]);
        // Update cache
        pageAccessCache = { data: data as PageAccess[], timestamp: Date.now() };
        isFetched.current = true;
      } else if (!error && data && data.length === 0) {
        // Empty result - don't cache, might be auth not ready
        isFetched.current = false;
      }
    } catch (err) {
      console.error('Error fetching page access:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Re-fetch when auth state changes or if not yet fetched
    if (isAuthenticated && !isFetched.current) {
      fetchPageAccess();
    }
  }, [fetchPageAccess, isAuthenticated]);

  const updatePageAccess = async (
    id: string,
    updates: Partial<Pick<PageAccess, "basic_visible" | "premium_visible" | "travel_mode_visible">>
  ) => {
    const { error } = await supabase
      .from("plan_page_access")
      .update(updates)
      .eq("id", id);

    if (!error) {
      const newData = pageAccess.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setPageAccess(newData);
      // Invalidate cache after update
      pageAccessCache = { data: newData, timestamp: Date.now() };
    }
    return { error };
  };

  const isPageVisible = (pageKey: string, planTier: string): boolean => {
    const page = pageAccess.find((p) => p.page_key === pageKey);
    if (!page) return true; // Default to visible if not configured
    
    if (planTier === "premium") {
      return page.premium_visible;
    }
    return page.basic_visible;
  };

  const isTravelModeVisible = (pageKey: string): boolean => {
    const page = pageAccess.find((p) => p.page_key === pageKey);
    if (!page) return true; // Default to visible if not configured
    return page.travel_mode_visible;
  };

  const getSortedPages = (context: SortContext): PageAccess[] => {
    const sortKey = `${context}_sort_order` as keyof PageAccess;
    return [...pageAccess].sort((a, b) => {
      const aOrder = (a[sortKey] as number) ?? a.sort_order ?? 0;
      const bOrder = (b[sortKey] as number) ?? b.sort_order ?? 0;
      return aOrder - bOrder;
    });
  };

  // Force refresh function - useful after admin changes
  const refreshPageAccess = useCallback(() => {
    pageAccessCache = null;
    isFetched.current = false;
    return fetchPageAccess(true);
  }, [fetchPageAccess]);

  return {
    pageAccess,
    isLoading,
    fetchPageAccess,
    updatePageAccess,
    isPageVisible,
    isTravelModeVisible,
    getSortedPages,
    refreshPageAccess,
  };
}
