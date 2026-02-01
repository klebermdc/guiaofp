import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface EditableContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  button_url: string | null;
  image_url: string | null;
  badge_text: string | null;
  metadata: Json;
  is_active: boolean;
  // Style fields
  text_color: string | null;
  bg_color: string | null;
  border_color: string | null;
  accent_color: string | null;
  font_size: string | null;
  font_weight: string | null;
  custom_classes: string | null;
  styles: Json;
}

export interface ContentStyles {
  text_color?: string | null;
  bg_color?: string | null;
  border_color?: string | null;
  accent_color?: string | null;
  font_size?: string | null;
  font_weight?: string | null;
  custom_classes?: string | null;
}

// Global cache for editable content - shared across all hooks
const contentCache = new Map<string, { content: EditableContent | null; timestamp: number }>();
const pageContentCache = new Map<string, { contents: Record<string, EditableContent>; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - content rarely changes

// Track pages that have been preloaded
const preloadedPages = new Set<string>();

const getCacheKey = (pageKey: string, sectionKey: string) => `${pageKey}:${sectionKey}`;

/**
 * Preload all content for a page in background - call once at page level
 * This populates the cache so individual hooks don't make requests
 */
export const preloadPageContent = async (pageKey: string): Promise<void> => {
  // Skip if already preloaded and cache is valid
  const cached = pageContentCache.get(pageKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return;
  }

  // Mark as preloading to prevent duplicate calls
  if (preloadedPages.has(pageKey)) {
    return;
  }
  preloadedPages.add(pageKey);

  try {
    const { data, error } = await supabase
      .from('editable_content')
      .select('*')
      .eq('page_key', pageKey);

    if (error) {
      console.error('Error preloading page content:', error);
      preloadedPages.delete(pageKey);
      return;
    }

    const contentMap: Record<string, EditableContent> = {};
    data?.forEach((item) => {
      const content = item as unknown as EditableContent;
      contentMap[item.section_key] = content;
      // Also populate individual cache entries
      const key = getCacheKey(pageKey, item.section_key);
      contentCache.set(key, { content, timestamp: Date.now() });
    });

    pageContentCache.set(pageKey, { contents: contentMap, timestamp: Date.now() });
  } catch (err) {
    console.error('Error preloading content:', err);
    preloadedPages.delete(pageKey);
  }
};

/**
 * Hook for single section - reads from cache if preloaded
 */
export const useEditableContent = (pageKey: string, sectionKey: string) => {
  const cacheKey = getCacheKey(pageKey, sectionKey);
  
  const [content, setContent] = useState<EditableContent | null>(() => {
    // Initialize from cache if available
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.content;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return false;
    }
    return true;
  });
  const [isSaving, setIsSaving] = useState(false);
  const { isGuide } = useUserRole();
  
  const fetchedKeyRef = useRef<string | null>(null);

  const fetchContent = useCallback(async (force = false) => {
    // Check cache first (may have been populated by preload)
    const cached = contentCache.get(cacheKey);
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (fetchedKeyRef.current === cacheKey) {
        return; // Already set, skip
      }
      setContent(cached.content);
      setIsLoading(false);
      fetchedKeyRef.current = cacheKey;
      return;
    }

    // Don't refetch if we already fetched for this exact key
    if (!force && fetchedKeyRef.current === cacheKey) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('editable_content')
        .select('*')
        .eq('page_key', pageKey)
        .eq('section_key', sectionKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching content:', error);
      }
      
      const contentData = data ? (data as unknown as EditableContent) : null;
      setContent(contentData);
      // Update cache
      contentCache.set(cacheKey, { content: contentData, timestamp: Date.now() });
      fetchedKeyRef.current = cacheKey;
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageKey, sectionKey, cacheKey]);

  useEffect(() => {
    // Check if content was preloaded
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setContent(cached.content);
      setIsLoading(false);
      fetchedKeyRef.current = cacheKey;
      return;
    }

    // Reset ref when keys change
    if (fetchedKeyRef.current !== cacheKey) {
      fetchedKeyRef.current = null;
    }
    fetchContent();
  }, [fetchContent, cacheKey]);

  const saveContent = async (updates: Partial<Omit<EditableContent, 'id' | 'metadata' | 'styles'>>) => {
    if (!isGuide) {
      toast.error('Você não tem permissão para editar conteúdos');
      return false;
    }

    setIsSaving(true);
    try {
      if (content?.id) {
        // Update existing
        const { error } = await supabase
          .from('editable_content')
          .update(updates)
          .eq('id', content.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('editable_content')
          .insert({
            page_key: pageKey,
            section_key: sectionKey,
            content_type: 'text',
            ...updates,
          });

        if (error) throw error;
      }

      toast.success('Conteúdo salvo com sucesso!');
      // Invalidate cache and refetch
      contentCache.delete(cacheKey);
      pageContentCache.delete(pageKey);
      preloadedPages.delete(pageKey);
      fetchedKeyRef.current = null;
      await fetchContent(true);
      return true;
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Erro ao salvar conteúdo');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Get inline styles from content
  const getStyles = useCallback((): React.CSSProperties => {
    if (!content) return {};
    
    const styles: React.CSSProperties = {};
    
    if (content.text_color) {
      styles.color = `hsl(${content.text_color})`;
    }
    if (content.bg_color) {
      styles.backgroundColor = `hsl(${content.bg_color})`;
    }
    if (content.border_color) {
      styles.borderColor = `hsl(${content.border_color})`;
    }
    
    return styles;
  }, [content]);

  // Get Tailwind classes from content
  const getClasses = useCallback((): string => {
    if (!content) return '';
    
    const classes: string[] = [];
    
    if (content.font_size) classes.push(content.font_size);
    if (content.font_weight) classes.push(content.font_weight);
    if (content.custom_classes) classes.push(content.custom_classes);
    
    return classes.join(' ');
  }, [content]);

  // Force refresh function
  const refetch = useCallback(() => {
    contentCache.delete(cacheKey);
    pageContentCache.delete(pageKey);
    preloadedPages.delete(pageKey);
    fetchedKeyRef.current = null;
    return fetchContent(true);
  }, [cacheKey, pageKey, fetchContent]);

  return {
    content,
    isLoading,
    isSaving,
    saveContent,
    canEdit: isGuide,
    refetch,
    getStyles,
    getClasses,
  };
};

/**
 * Hook for fetching all content for a page - use for admin/bulk operations
 */
export const usePageContent = (pageKey: string) => {
  const [contents, setContents] = useState<Record<string, EditableContent>>(() => {
    // Initialize from cache if available
    const cached = pageContentCache.get(pageKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.contents;
    }
    return {};
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading
    const cached = pageContentCache.get(pageKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return false;
    }
    return true;
  });
  const { isGuide } = useUserRole();
  
  const fetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchContents = async () => {
      // Skip if we have valid cache
      const cached = pageContentCache.get(pageKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (fetchedKeyRef.current === pageKey) {
          return;
        }
        setContents(cached.contents);
        setIsLoading(false);
        fetchedKeyRef.current = pageKey;
        return;
      }

      // Don't refetch if we already fetched for this key
      if (fetchedKeyRef.current === pageKey) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('editable_content')
          .select('*')
          .eq('page_key', pageKey);

        if (error) throw error;

        const contentMap: Record<string, EditableContent> = {};
        data?.forEach((item) => {
          const content = item as unknown as EditableContent;
          contentMap[item.section_key] = content;
          // Also populate individual cache
          const key = getCacheKey(pageKey, item.section_key);
          contentCache.set(key, { content, timestamp: Date.now() });
        });
        setContents(contentMap);
        // Update cache
        pageContentCache.set(pageKey, { contents: contentMap, timestamp: Date.now() });
        fetchedKeyRef.current = pageKey;
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Reset ref when key changes
    if (fetchedKeyRef.current !== pageKey) {
      fetchedKeyRef.current = null;
    }
    fetchContents();
  }, [pageKey]);

  return { contents, isLoading, canEdit: isGuide };
};
