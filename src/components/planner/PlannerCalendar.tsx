import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { format, eachDayOfInterval, parseISO, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PlannerItem {
  id: string;
  planner_id: string;
  date: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night' | 'all_day';
  start_time?: string;
  end_time?: string;
  item_type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity' | 'hotel' | 'custom';
  item_id?: string;
  item_name: string;
  category: string;
  color: string;
  icon?: string;
  duration?: number;
  notes?: string;
  order_index: number;
  completed: boolean;
  reservation_confirmed?: boolean;
  reservation_time?: string;
}

interface PlannerCalendarProps {
  startDate: string;
  endDate: string;
  items: PlannerItem[];
  onDrop: (item: any, date: string, timeSlot: string) => void;
  onRemove: (itemId: string) => void;
  onReorder: (date: string, timeSlot: string, items: PlannerItem[]) => void;
}

// Generate date range helper
const generateDateRange = (startDate: string, endDate: string): string[] => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'));
};

// Format date helper
const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), "d 'de' MMMM", { locale: ptBR });
};

// Format day of week helper
const formatDayOfWeek = (dateStr: string): string => {
  return format(parseISO(dateStr), 'EEEE', { locale: ptBR });
};

// Get category icon
const getCategoryIcon = (category: string, itemType: string): string => {
  if (itemType === 'park') {
    if (category === 'disney') return '🏰';
    if (category === 'universal') return '⚡';
    return '🎢';
  }
  if (itemType === 'attraction') return '🎠';
  if (itemType === 'restaurant') return '🍽️';
  if (itemType === 'shopping') {
    if (category === 'outlet') return '🛍️';
    if (category === 'walmart' || category === 'target') return '🛒';
    return '🏬';
  }
  if (itemType === 'activity') return '🌴';
  if (itemType === 'hotel') return '🏨';
  return '📌';
};

export const PlannerCalendar = ({
  startDate,
  endDate,
  items,
  onDrop,
  onRemove,
  onReorder,
}: PlannerCalendarProps) => {
  const dates = generateDateRange(startDate, endDate);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeItem = items.find(item => item.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id as string;
    
    // Check if dropped on a time slot
    if (overId.includes('-')) {
      const [date, timeSlot] = overId.split('-').slice(0, 2);
      const dateStr = overId.substring(0, 10); // Extract yyyy-MM-dd
      const slot = overId.substring(11); // Extract time slot
      
      const activeItem = items.find(item => item.id === active.id);
      if (activeItem) {
        // If moving to a different slot
        if (activeItem.date !== dateStr || activeItem.time_slot !== slot) {
          onDrop(activeItem, dateStr, slot);
        }
      }
    }

    // Handle reordering within same slot
    if (active.id !== over.id) {
      const activeItem = items.find(item => item.id === active.id);
      const overItem = items.find(item => item.id === over.id);
      
      if (activeItem && overItem && activeItem.date === overItem.date && activeItem.time_slot === overItem.time_slot) {
        const slotItems = items
          .filter(item => item.date === activeItem.date && item.time_slot === activeItem.time_slot)
          .sort((a, b) => a.order_index - b.order_index);
        
        const oldIndex = slotItems.findIndex(item => item.id === active.id);
        const newIndex = slotItems.findIndex(item => item.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedItems = arrayMove(slotItems, oldIndex, newIndex).map((item, idx) => ({
            ...item,
            order_index: idx,
          }));
          onReorder(activeItem.date, activeItem.time_slot, reorderedItems);
        }
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {dates.map((date, index) => (
          <DayRow
            key={date}
            date={date}
            dayNumber={index + 1}
            items={items.filter(item => item.date === date)}
            onDrop={onDrop}
            onRemove={onRemove}
            onReorder={onReorder}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <ActivityCard item={activeItem} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Componente: DayRow
interface DayRowProps {
  date: string;
  dayNumber: number;
  items: PlannerItem[];
  onDrop: (item: any, date: string, timeSlot: string) => void;
  onRemove: (itemId: string) => void;
  onReorder: (date: string, timeSlot: string, items: PlannerItem[]) => void;
}

const DayRow = ({ date, dayNumber, items, onDrop, onRemove, onReorder }: DayRowProps) => {
  const dayOfWeek = formatDayOfWeek(date);
  const isWeekendDay = isWeekend(parseISO(date));

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      isWeekendDay 
        ? 'bg-primary/5 border-primary/20' 
        : 'bg-card border-border'
    }`}>
      {/* Header do Dia */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dia {dayNumber}
          </span>
          <h3 className="text-lg font-semibold text-foreground capitalize">
            {formatDate(date)} — {dayOfWeek}
          </h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {items.length} {items.length === 1 ? 'atividade' : 'atividades'}
          </Badge>
        </div>
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TimeSlotDropZone
          date={date}
          timeSlot="morning"
          label="☀️ Manhã"
          sublabel="6h - 12h"
          items={items.filter(i => i.time_slot === 'morning')}
          onRemove={onRemove}
        />

        <TimeSlotDropZone
          date={date}
          timeSlot="afternoon"
          label="🌤️ Tarde"
          sublabel="12h - 18h"
          items={items.filter(i => i.time_slot === 'afternoon')}
          onRemove={onRemove}
        />

        <TimeSlotDropZone
          date={date}
          timeSlot="evening"
          label="🌙 Noite"
          sublabel="18h - 00h"
          items={items.filter(i => i.time_slot === 'evening')}
          onRemove={onRemove}
        />

        <TimeSlotDropZone
          date={date}
          timeSlot="night"
          label="🌃 Madrugada"
          sublabel="00h - 6h"
          items={items.filter(i => i.time_slot === 'night')}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

// Componente: TimeSlotDropZone
interface TimeSlotDropZoneProps {
  date: string;
  timeSlot: string;
  label: string;
  sublabel: string;
  items: PlannerItem[];
  onRemove: (itemId: string) => void;
}

const TimeSlotDropZone = ({ date, timeSlot, label, sublabel, items, onRemove }: TimeSlotDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${timeSlot}`,
    data: { date, timeSlot },
  });

  const sortedItems = [...items].sort((a, b) => a.order_index - b.order_index);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[140px] border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
        isOver 
          ? 'border-primary bg-primary/10 scale-[1.02]' 
          : 'border-border/50 hover:border-border'
      }`}
    >
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>

      <SortableContext
        items={sortedItems.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedItems.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-center">
              <p className="text-xs text-muted-foreground">
                Arraste atividades aqui
              </p>
            </div>
          ) : (
            sortedItems.map(item => (
              <SortableActivityCard
                key={item.id}
                item={item}
                onRemove={() => onRemove(item.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// Componente: SortableActivityCard
interface SortableActivityCardProps {
  item: PlannerItem;
  onRemove: () => void;
}

const SortableActivityCard = ({ item, onRemove }: SortableActivityCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group touch-none"
    >
      <ActivityCard item={item} onRemove={onRemove} />
    </div>
  );
};

// Componente: ActivityCard
interface ActivityCardProps {
  item: PlannerItem;
  isDragging?: boolean;
  onRemove?: () => void;
}

const ActivityCard = ({ item, isDragging, onRemove }: ActivityCardProps) => {
  const icon = item.icon || getCategoryIcon(item.category, item.item_type);
  
  return (
    <div
      className={`p-2.5 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'
      }`}
      style={{ 
        backgroundColor: `${item.color}15`, 
        border: `1.5px solid ${item.color}`,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm flex-shrink-0">{icon}</span>
          <span className="truncate text-foreground font-medium">
            {item.item_name}
          </span>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/20 text-destructive flex-shrink-0"
            aria-label="Remover item"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
        {item.duration && (
          <span className="flex items-center gap-0.5">
            ⏱️ {item.duration}min
          </span>
        )}
        {item.reservation_confirmed && (
          <span className="flex items-center gap-0.5 text-success">
            ✓ Reservado
          </span>
        )}
        {item.start_time && (
          <span className="flex items-center gap-0.5">
            🕐 {item.start_time}
          </span>
        )}
      </div>

      {item.notes && (
        <p className="mt-1.5 text-[10px] text-muted-foreground line-clamp-1 italic">
          {item.notes}
        </p>
      )}
    </div>
  );
};

export default PlannerCalendar;
