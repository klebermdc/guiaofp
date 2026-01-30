import { useState, useEffect, useCallback } from 'react';
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
}

export const useEditableContent = (pageKey: string, sectionKey: string) => {
  const [content, setContent] = useState<EditableContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isGuide } = useUserRole();

  const fetchContent = useCallback(async () => {
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
      
      if (data) {
        setContent(data as EditableContent);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageKey, sectionKey]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const saveContent = async (updates: Partial<Omit<EditableContent, 'id' | 'metadata'>>) => {
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
      await fetchContent();
      return true;
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Erro ao salvar conteúdo');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content,
    isLoading,
    isSaving,
    saveContent,
    canEdit: isGuide,
    refetch: fetchContent,
  };
};

// Hook for fetching all content for a page
export const usePageContent = (pageKey: string) => {
  const [contents, setContents] = useState<Record<string, EditableContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { isGuide } = useUserRole();

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const { data, error } = await supabase
          .from('editable_content')
          .select('*')
          .eq('page_key', pageKey);

        if (error) throw error;

        const contentMap: Record<string, EditableContent> = {};
        data?.forEach((item) => {
          contentMap[item.section_key] = item as EditableContent;
        });
        setContents(contentMap);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, [pageKey]);

  return { contents, isLoading, canEdit: isGuide };
};
