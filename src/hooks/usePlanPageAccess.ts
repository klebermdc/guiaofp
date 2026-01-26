import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageAccess {
  id: string;
  page_key: string;
  page_name: string;
  page_icon: string;
  basic_visible: boolean;
  premium_visible: boolean;
  sort_order: number;
}

export function usePlanPageAccess() {
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchPageAccess();
  }, [fetchPageAccess]);

  const updatePageAccess = async (
    id: string,
    updates: Partial<Pick<PageAccess, "basic_visible" | "premium_visible">>
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

  return {
    pageAccess,
    isLoading,
    fetchPageAccess,
    updatePageAccess,
    isPageVisible,
  };
}
