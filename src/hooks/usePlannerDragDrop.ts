import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  if (category === 'disney') return '🏰';
  if (category === 'universal') return '⚡';
  if (category === 'seaworld') return '🐬';
  if (category === 'outlet') return '🛍️';
  if (category === 'supermarket') return '🛒';
  if (category === 'mall') return '🏬';
  
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

const transformDbItem = (item: any): PlannerItem => ({
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
});

interface UsePlannerDragDropOptions {
  plannerId: string;
  onItemsChange?: (items: PlannerItem[]) => void;
}

export const usePlannerDragDrop = ({ plannerId, onItemsChange }: UsePlannerDragDropOptions) => {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const itemsRef = useRef<PlannerItem[]>([]);

  // Keep ref in sync for rollback
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Optimistic helper: update state immediately, persist in background, rollback on error
  const optimisticUpdate = useCallback(async (
    newItems: PlannerItem[],
    persistFn: () => Promise<void>,
    errorMessage: string
  ) => {
    const previousItems = itemsRef.current;
    
    // 1. Optimistic update – instant UI response
    setItems(newItems);
    onItemsChange?.(newItems);

    try {
      // 2. Persist in background
      await persistFn();
    } catch (error) {
      // 3. Rollback on failure
      console.error(errorMessage, error);
      setItems(previousItems);
      onItemsChange?.(previousItems);
      toast.error(errorMessage, { duration: 4000 });
    }
  }, [onItemsChange]);

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
        
        const transformedItems = (data || []).map(transformDbItem);
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

  // Handle drop from library – optimistic with temp ID
  const handleDrop = useCallback(async (
    draggedItem: LibraryItem | any,
    date: string,
    timeSlot: string
  ): Promise<PlannerItem | null> => {
    if (!plannerId) return null;

    const existingSlotItems = itemsRef.current.filter(
      i => i.date === date && i.time_slot === timeSlot
    );

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const optimisticItem: PlannerItem = {
      id: tempId,
      planner_id: plannerId,
      date,
      time_slot: timeSlot as PlannerItem['time_slot'],
      item_type: determineItemType(draggedItem),
      item_id: (draggedItem.id && !draggedItem.id.startsWith('custom-')) ? draggedItem.id : undefined,
      item_name: draggedItem.name,
      category: determineCategory(draggedItem),
      color: determineColor(draggedItem),
      icon: determineIcon(draggedItem),
      duration: draggedItem.duration || undefined,
      order_index: existingSlotItems.length,
      completed: false,
      reservation_confirmed: undefined,
    };

    // 1. Optimistic: add item immediately
    const newItems = [...itemsRef.current, optimisticItem];
    const previousItems = itemsRef.current;
    setItems(newItems);
    onItemsChange?.(newItems);

    try {
      // 2. Persist
      const { data, error } = await supabase
        .from('planner_items')
        .insert({
          planner_id: plannerId,
          date,
          time_slot: timeSlot,
          item_type: optimisticItem.item_type,
          item_id: optimisticItem.item_id || null,
          item_name: optimisticItem.item_name,
          category: optimisticItem.category,
          color: optimisticItem.color,
          icon: optimisticItem.icon || null,
          duration: optimisticItem.duration || null,
          order_index: optimisticItem.order_index,
          completed: false,
          reservation_confirmed: false,
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Replace temp ID with real ID
      const realItem = transformDbItem(data);
      setItems(prev => {
        const updated = prev.map(i => i.id === tempId ? realItem : i);
        onItemsChange?.(updated);
        return updated;
      });

      return realItem;
    } catch (error) {
      // 4. Rollback
      console.error('Error adding item:', error);
      setItems(previousItems);
      onItemsChange?.(previousItems);
      toast.error('Erro ao adicionar item ao roteiro', { duration: 4000 });
      return null;
    }
  }, [plannerId, onItemsChange]);

  // Handle remove item – optimistic
  const handleRemove = useCallback(async (itemId: string) => {
    const newItems = itemsRef.current.filter(i => i.id !== itemId);

    await optimisticUpdate(
      newItems,
      async () => {
        const { error } = await supabase
          .from('planner_items')
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      },
      'Erro ao remover item'
    );
  }, [optimisticUpdate]);

  // Handle reorder within same slot – optimistic
  const handleReorder = useCallback(async (
    date: string,
    timeSlot: string,
    reorderedItems: PlannerItem[]
  ) => {
    const otherItems = itemsRef.current.filter(
      item => !(item.date === date && item.time_slot === timeSlot)
    );
    const newItems = [...otherItems, ...reorderedItems];

    await optimisticUpdate(
      newItems,
      async () => {
        const updates = reorderedItems.map((item, index) =>
          supabase
            .from('planner_items')
            .update({ order_index: index })
            .eq('id', item.id)
        );
        await Promise.all(updates);
      },
      'Erro ao reordenar itens'
    );
  }, [optimisticUpdate]);

  // Handle move to different slot – optimistic
  const handleMoveToSlot = useCallback(async (
    itemId: string,
    newDate: string,
    newTimeSlot: string
  ) => {
    const existingSlotItems = itemsRef.current.filter(
      i => i.date === newDate && i.time_slot === newTimeSlot
    );
    const newOrderIndex = existingSlotItems.length;

    const newItems = itemsRef.current.map(item =>
      item.id === itemId
        ? { ...item, date: newDate, time_slot: newTimeSlot as PlannerItem['time_slot'], order_index: newOrderIndex }
        : item
    );

    await optimisticUpdate(
      newItems,
      async () => {
        const { error } = await supabase
          .from('planner_items')
          .update({
            date: newDate,
            time_slot: newTimeSlot,
            order_index: newOrderIndex,
          })
          .eq('id', itemId);
        if (error) throw error;
      },
      'Erro ao mover item'
    );
  }, [optimisticUpdate]);

  // Handle update item – optimistic
  const handleUpdateItem = useCallback(async (
    itemId: string,
    updates: Partial<PlannerItem>
  ) => {
    const newItems = itemsRef.current.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const dbUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        dbUpdates[key] = value;
      }
    }

    await optimisticUpdate(
      newItems,
      async () => {
        const { error } = await supabase
          .from('planner_items')
          .update(dbUpdates)
          .eq('id', itemId);
        if (error) throw error;
      },
      'Erro ao atualizar item'
    );
  }, [optimisticUpdate]);

  // Toggle completed – optimistic
  const toggleCompleted = useCallback(async (itemId: string) => {
    const item = itemsRef.current.find(i => i.id === itemId);
    if (!item) return;

    await handleUpdateItem(itemId, { completed: !item.completed });
  }, [handleUpdateItem]);

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
      
      const transformedItems = (data || []).map(transformDbItem);
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
