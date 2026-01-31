import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageAccess {
  id: string;
  page_key: string;
  page_name: string;
  page_icon: string;
  basic_visible: boolean;
  premium_visible: boolean;
  travel_mode_visible: boolean;
  sort_order: number;
  mobile_sort_order: number;
  desktop_sort_order: number;
  travel_mode_sort_order: number;
}

export type SortContext = 'mobile' | 'desktop' | 'travel_mode';

export function usePlanPageAccess() {
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetched = useRef(false);

  const fetchPageAccess = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("plan_page_access")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setPageAccess(data as PageAccess[]);
      }
    } catch (err) {
      console.error('Error fetching page access:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch once on mount to avoid duplicate calls
    if (!isFetched.current) {
      isFetched.current = true;
      fetchPageAccess();
    }
  }, [fetchPageAccess]);

  const updatePageAccess = async (
    id: string,
    updates: Partial<Pick<PageAccess, "basic_visible" | "premium_visible" | "travel_mode_visible">>
  ) => {
    const { error } = await supabase
      .from("plan_page_access")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setPageAccess((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
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

  return {
    pageAccess,
    isLoading,
    fetchPageAccess,
    updatePageAccess,
    isPageVisible,
    isTravelModeVisible,
    getSortedPages,
  };
}
