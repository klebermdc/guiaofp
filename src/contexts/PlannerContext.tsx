import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { PlannerItem } from '@/components/planner/PlannerCalendar';
import type { LibraryItem } from '@/components/planner/ActivityLibrary';

const STORAGE_KEY = 'planner_draft';

interface PlannerContextType {
  // State
  items: PlannerItem[];
  selectedDay: number;
  plannerId: string | null;
  isLoading: boolean;
  isSaving: boolean;

  // Setters
  setItems: (items: PlannerItem[]) => void;
  setSelectedDay: (day: number) => void;
  setPlannerId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Derived data
  itemsByDate: Record<string, PlannerItem[]>;
  itemsByDateAndSlot: Record<string, Record<string, PlannerItem[]>>;
  totalItems: number;
  completedItems: number;

  // Actions
  addItem: (item: PlannerItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<PlannerItem>) => void;
  replaceItem: (tempId: string, realItem: PlannerItem) => void;
  clearDraft: () => void;
}

const PlannerContext = createContext<PlannerContextType | null>(null);

export const usePlannerContext = () => {
  const ctx = useContext(PlannerContext);
  if (!ctx) {
    throw new Error('usePlannerContext must be used within a PlannerProvider');
  }
  return ctx;
};

// Optional hook that returns null if not in provider (for components that may or may not be in planner)
export const usePlannerContextOptional = () => useContext(PlannerContext);

interface PlannerProviderProps {
  children: React.ReactNode;
}

export const PlannerProvider = ({ children }: PlannerProviderProps) => {
  // Restore draft from localStorage on mount
  const [items, setItemsRaw] = useState<PlannerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDay, setSelectedDay] = useState(0);
  const [plannerId, setPlannerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Persist draft to localStorage on change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const setItems = useCallback((newItems: PlannerItem[]) => {
    setItemsRaw(newItems);
    
    // Debounced localStorage save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      } catch {
        // localStorage full or unavailable – silently ignore
      }
    }, 500);
  }, []);

  // Derived: items grouped by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, PlannerItem[]> = {};
    for (const item of items) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
    // Sort each group by order_index
    for (const date in grouped) {
      grouped[date].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    }
    return grouped;
  }, [items]);

  // Derived: items grouped by date and slot
  const itemsByDateAndSlot = useMemo(() => {
    const grouped: Record<string, Record<string, PlannerItem[]>> = {};
    for (const item of items) {
      if (!grouped[item.date]) grouped[item.date] = {};
      const slot = item.time_slot || 'morning';
      if (!grouped[item.date][slot]) grouped[item.date][slot] = [];
      grouped[item.date][slot].push(item);
    }
    // Sort each slot group
    for (const date in grouped) {
      for (const slot in grouped[date]) {
        grouped[date][slot].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }
    }
    return grouped;
  }, [items]);

  const totalItems = items.length;
  const completedItems = useMemo(() => items.filter(i => i.completed).length, [items]);

  // Actions
  const addItem = useCallback((item: PlannerItem) => {
    setItems([...items, item]);
  }, [items, setItems]);

  const removeItem = useCallback((id: string) => {
    setItems(items.filter(i => i.id !== id));
  }, [items, setItems]);

  const updateItem = useCallback((id: string, updates: Partial<PlannerItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [items, setItems]);

  const replaceItem = useCallback((tempId: string, realItem: PlannerItem) => {
    setItems(items.map(i => i.id === tempId ? realItem : i));
  }, [items, setItems]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItemsRaw([]);
  }, []);

  const value = useMemo<PlannerContextType>(() => ({
    items,
    selectedDay,
    plannerId,
    isLoading,
    isSaving,
    setItems,
    setSelectedDay,
    setPlannerId,
    setIsLoading,
    setIsSaving,
    itemsByDate,
    itemsByDateAndSlot,
    totalItems,
    completedItems,
    addItem,
    removeItem,
    updateItem,
    replaceItem,
    clearDraft,
  }), [
    items, selectedDay, plannerId, isLoading, isSaving,
    setItems, itemsByDate, itemsByDateAndSlot,
    totalItems, completedItems,
    addItem, removeItem, updateItem, replaceItem, clearDraft,
  ]);

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};
