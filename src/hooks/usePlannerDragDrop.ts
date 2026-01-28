import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PlannerItem } from '@/components/planner/PlannerCalendar';
import type { LibraryItem } from '@/components/planner/ActivityLibrary';

// Helper functions
const determineItemType = (item: LibraryItem | any): PlannerItem['item_type'] => {
  if (item.type) return item.type;
  if (item.park_id && item.cuisine) return 'restaurant';
  if (item.park_id) return 'attraction';
  if (item.cuisine) return 'restaurant';
  if (item.brands) return 'shopping';
  return 'activity';
};

const determineCategory = (item: LibraryItem | any): string => {
  if (item.category) return item.category;
  if (item.park_slug?.includes('disney')) return 'disney';
  if (item.park_slug?.includes('universal')) return 'universal';
  if (item.type === 'outlet') return 'outlet';
  return 'other';
};

const determineColor = (item: LibraryItem | any): string => {
  if (item.color) return item.color;
  
  const category = determineCategory(item);
  const colors: Record<string, string> = {
    disney: '#1E40AF',
    universal: '#7C3AED',
    seaworld: '#0891B2',
    outlet: '#A855F7',
    mall: '#EC4899',
    supermarket: '#0066CC',
    restaurante: '#F97316',
    atividade: '#14B8A6',
    shopping: '#10B981',
    restaurant: '#EF4444',
    activity: '#F59E0B',
    other: '#6B7280',
  };
  
  return colors[category] || colors.other;
};

const determineIcon = (item: LibraryItem | any): string => {
  if (item.icon) return item.icon;
  
  const type = determineItemType(item);
  const category = determineCategory(item);
  
  // Category-specific icons
  if (category === 'disney') return '🏰';
  if (category === 'universal') return '⚡';
  if (category === 'seaworld') return '🐬';
  if (category === 'outlet') return '🛍️';
  if (category === 'supermarket') return '🛒';
  if (category === 'mall') return '🏬';
  
  // Type-specific icons
  const icons: Record<string, string> = {
    park: '🎢',
    attraction: '🎠',
    restaurant: '🍽️',
    shopping: '🛒',
    activity: '🌴',
    hotel: '🏨',
    custom: '📍',
  };
  
  return icons[type] || icons.custom;
};

interface UsePlannerDragDropOptions {
  plannerId: string;
  onItemsChange?: (items: PlannerItem[]) => void;
}

export const usePlannerDragDrop = ({ plannerId, onItemsChange }: UsePlannerDragDropOptions) => {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch items on mount
  useEffect(() => {
    if (!plannerId) return;

    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('planner_items')
          .select('*')
          .eq('planner_id', plannerId)
          .order('date', { ascending: true })
          .order('order_index', { ascending: true });

        if (error) throw error;
        
        // Transform database items to PlannerItem format
        const transformedItems: PlannerItem[] = (data || []).map(item => ({
          id: item.id,
          planner_id: item.planner_id,
          date: item.date,
          time_slot: item.time_slot as PlannerItem['time_slot'],
          start_time: item.start_time || undefined,
          end_time: item.end_time || undefined,
          item_type: item.item_type as PlannerItem['item_type'],
          item_id: item.item_id || undefined,
          item_name: item.item_name,
          category: item.category,
          color: item.color,
          icon: item.icon || undefined,
          duration: item.duration || undefined,
          notes: item.notes || undefined,
          order_index: item.order_index || 0,
          completed: item.completed || false,
          reservation_confirmed: item.reservation_confirmed || undefined,
          reservation_time: item.reservation_time || undefined,
        }));

        setItems(transformedItems);
        onItemsChange?.(transformedItems);
      } catch (error) {
        console.error('Error fetching planner items:', error);
        toast.error('Erro ao carregar itens do roteiro');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [plannerId, onItemsChange]);

  // Handle drop from library
  const handleDrop = useCallback(async (
    draggedItem: LibraryItem | any,
    date: string,
    timeSlot: string
  ) => {
    if (!plannerId) return;

    setIsSaving(true);
    try {
      const existingSlotItems = items.filter(
        i => i.date === date && i.time_slot === timeSlot
      );

      const newItem = {
        planner_id: plannerId,
        date,
        time_slot: timeSlot,
        item_type: determineItemType(draggedItem),
        item_id: draggedItem.id || null,
        item_name: draggedItem.name,
        category: determineCategory(draggedItem),
        color: determineColor(draggedItem),
        icon: determineIcon(draggedItem),
        duration: draggedItem.duration || null,
        order_index: existingSlotItems.length,
        completed: false,
        reservation_confirmed: false,
      };

      const { data, error } = await supabase
        .from('planner_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      const transformedItem: PlannerItem = {
        id: data.id,
        planner_id: data.planner_id,
        date: data.date,
        time_slot: data.time_slot as PlannerItem['time_slot'],
        item_type: data.item_type as PlannerItem['item_type'],
        item_id: data.item_id || undefined,
        item_name: data.item_name,
        category: data.category,
        color: data.color,
        icon: data.icon || undefined,
        duration: data.duration || undefined,
        order_index: data.order_index || 0,
        completed: data.completed || false,
        reservation_confirmed: data.reservation_confirmed || undefined,
      };

      setItems(prev => {
        const newItems = [...prev, transformedItem];
        onItemsChange?.(newItems);
        return newItems;
      });

      toast.success(`${draggedItem.name} adicionado ao roteiro`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Erro ao adicionar item ao roteiro');
    } finally {
      setIsSaving(false);
    }
  }, [plannerId, items, onItemsChange]);

  // Handle remove item
  const handleRemove = useCallback(async (itemId: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('planner_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => {
        const newItems = prev.filter(i => i.id !== itemId);
        onItemsChange?.(newItems);
        return newItems;
      });

      toast.success('Item removido do roteiro');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Erro ao remover item');
    } finally {
      setIsSaving(false);
    }
  }, [onItemsChange]);

  // Handle reorder within same slot
  const handleReorder = useCallback(async (
    date: string,
    timeSlot: string,
    reorderedItems: PlannerItem[]
  ) => {
    // Optimistic update
    setItems(prev => {
      const otherItems = prev.filter(
        item => !(item.date === date && item.time_slot === timeSlot)
      );
      const newItems = [...otherItems, ...reorderedItems];
      onItemsChange?.(newItems);
      return newItems;
    });

    // Batch update in database
    try {
      const updates = reorderedItems.map((item, index) => 
        supabase
          .from('planner_items')
          .update({ order_index: index })
          .eq('id', item.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering items:', error);
      toast.error('Erro ao reordenar itens');
    }
  }, [onItemsChange]);

  // Handle move to different slot
  const handleMoveToSlot = useCallback(async (
    itemId: string,
    newDate: string,
    newTimeSlot: string
  ) => {
    setIsSaving(true);
    try {
      const existingSlotItems = items.filter(
        i => i.date === newDate && i.time_slot === newTimeSlot
      );

      const { error } = await supabase
        .from('planner_items')
        .update({
          date: newDate,
          time_slot: newTimeSlot,
          order_index: existingSlotItems.length,
        })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => {
        const newItems = prev.map(item => 
          item.id === itemId
            ? { ...item, date: newDate, time_slot: newTimeSlot as PlannerItem['time_slot'], order_index: existingSlotItems.length }
            : item
        );
        onItemsChange?.(newItems);
        return newItems;
      });
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Erro ao mover item');
    } finally {
      setIsSaving(false);
    }
  }, [items, onItemsChange]);

  // Handle update item
  const handleUpdateItem = useCallback(async (
    itemId: string,
    updates: Partial<PlannerItem>
  ) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('planner_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => {
        const newItems = prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
        onItemsChange?.(newItems);
        return newItems;
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setIsSaving(false);
    }
  }, [onItemsChange]);

  // Toggle completed
  const toggleCompleted = useCallback(async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    await handleUpdateItem(itemId, { completed: !item.completed });
  }, [items, handleUpdateItem]);

  // Refetch items
  const refetchItems = useCallback(async () => {
    if (!plannerId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('planner_items')
        .select('*')
        .eq('planner_id', plannerId)
        .order('date', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      const transformedItems: PlannerItem[] = (data || []).map(item => ({
        id: item.id,
        planner_id: item.planner_id,
        date: item.date,
        time_slot: item.time_slot as PlannerItem['time_slot'],
        start_time: item.start_time || undefined,
        end_time: item.end_time || undefined,
        item_type: item.item_type as PlannerItem['item_type'],
        item_id: item.item_id || undefined,
        item_name: item.item_name,
        category: item.category,
        color: item.color,
        icon: item.icon || undefined,
        duration: item.duration || undefined,
        notes: item.notes || undefined,
        order_index: item.order_index || 0,
        completed: item.completed || false,
        reservation_confirmed: item.reservation_confirmed || undefined,
        reservation_time: item.reservation_time || undefined,
      }));

      setItems(transformedItems);
      onItemsChange?.(transformedItems);
    } catch (error) {
      console.error('Error refetching planner items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [plannerId, onItemsChange]);

  return {
    items,
    isLoading,
    isSaving,
    handleDrop,
    handleRemove,
    handleReorder,
    handleMoveToSlot,
    handleUpdateItem,
    toggleCompleted,
    refetchItems,
  };
};

export default usePlannerDragDrop;
