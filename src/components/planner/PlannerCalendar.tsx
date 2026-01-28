import { useState, useMemo } from 'react';
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
import { Trash2, Check, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onToggleComplete?: (itemId: string) => void;
}

// Time slots configuration
const TIME_SLOTS = [
  { id: 'morning', label: 'Manhã', icon: '☀️', hours: '6h - 12h' },
  { id: 'afternoon', label: 'Tarde', icon: '🌤️', hours: '12h - 18h' },
  { id: 'evening', label: 'Noite', icon: '🌙', hours: '18h - 00h' },
  { id: 'night', label: 'Madrugada', icon: '🌃', hours: '00h - 6h' },
] as const;

// Category colors - dark theme compatible
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  disney: { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700' },
  universal: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700' },
  seaworld: { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-700' },
  outlet: { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-700' },
  mall: { bg: 'bg-pink-950/60', text: 'text-pink-300', border: 'border-pink-700' },
  supermarket: { bg: 'bg-green-950/60', text: 'text-green-300', border: 'border-green-700' },
  restaurant: { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700' },
  restaurante: { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700' },
  activity: { bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-700' },
  atividade: { bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-700' },
  hotel: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-700' },
  other: { bg: 'bg-muted/60', text: 'text-foreground', border: 'border-border' },
};

const getCategoryStyle = (category: string) => {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
};

export const PlannerCalendar = ({
  startDate,
  endDate,
  items,
  onDrop,
  onRemove,
  onReorder,
  onToggleComplete,
}: PlannerCalendarProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeItem = items.find(item => item.id === activeId);

  // Generate date range
  const dates = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'));
  }, [startDate, endDate]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id as string;
    
    // Check if dropped on a time slot (format: "date-YYYY-MM-DD-slot-slotId")
    const slotMatch = overId.match(/^date-(\d{4}-\d{2}-\d{2})-slot-(\w+)$/);
    if (slotMatch) {
      const [, dateStr, slot] = slotMatch;
      
      const draggedItem = items.find(item => item.id === active.id);
      if (draggedItem && (draggedItem.date !== dateStr || draggedItem.time_slot !== slot)) {
        onDrop(draggedItem, dateStr, slot);
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
            onRemove={onRemove}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && <ActivityCard item={activeItem} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

// Day Row Component
interface DayRowProps {
  date: string;
  dayNumber: number;
  items: PlannerItem[];
  onRemove: (itemId: string) => void;
  onToggleComplete?: (itemId: string) => void;
}

const DayRow = ({ date, dayNumber, items, onRemove, onToggleComplete }: DayRowProps) => {
  const parsedDate = parseISO(date);
  const isWeekendDay = isWeekend(parsedDate);
  const dayOfWeek = format(parsedDate, 'EEEE', { locale: ptBR });
  const formattedDate = format(parsedDate, "d 'de' MMMM", { locale: ptBR });

  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      isWeekendDay 
        ? "bg-primary/5 border-primary/30" 
        : "bg-card border-border"
    )}>
      {/* Day Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
              isWeekendDay ? "bg-blue-200 text-blue-700" : "bg-muted text-muted-foreground"
            )}>
              Dia {dayNumber}
            </span>
            {isWeekendDay && (
              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-600 border-blue-200">
                Fim de semana
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold text-foreground capitalize mt-1">
            {formattedDate} — {dayOfWeek}
          </h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {items.length} {items.length === 1 ? 'atividade' : 'atividades'}
        </Badge>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
        {TIME_SLOTS.map(slot => (
          <TimeSlotDropZone
            key={`${date}-${slot.id}`}
            date={date}
            slot={slot}
            items={items.filter(i => i.time_slot === slot.id)}
            onRemove={onRemove}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  );
};

// Time Slot Drop Zone Component
interface TimeSlotDropZoneProps {
  date: string;
  slot: typeof TIME_SLOTS[number];
  items: PlannerItem[];
  onRemove: (itemId: string) => void;
  onToggleComplete?: (itemId: string) => void;
}

const TimeSlotDropZone = ({ date, slot, items, onRemove, onToggleComplete }: TimeSlotDropZoneProps) => {
  // Format: date-YYYY-MM-DD-slot-slotId (matching PlannerManual's expected format)
  const dropId = `date-${date}-slot-${slot.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { date, timeSlot: slot.id },
  });

  const sortedItems = [...items].sort((a, b) => a.order_index - b.order_index);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] border-2 border-dashed rounded-lg p-2 transition-all duration-200",
        isOver 
          ? "border-primary bg-primary/20 scale-[1.02] shadow-md" 
          : "border-border/40 hover:border-border/80 bg-background/50"
      )}
    >
      {/* Slot Header */}
      <div className="mb-2 pb-1 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{slot.icon}</span>
          <span className="text-xs font-medium text-foreground">{slot.label}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{slot.hours}</p>
      </div>

      {/* Items */}
      <SortableContext
        items={sortedItems.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1.5">
          {sortedItems.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-[10px] text-muted-foreground/60">
                Arraste itens aqui
              </p>
            </div>
          ) : (
            sortedItems.map(item => (
              <SortableActivityCard
                key={item.id}
                item={item}
                onRemove={() => onRemove(item.id)}
                onToggleComplete={onToggleComplete ? () => onToggleComplete(item.id) : undefined}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// Sortable Activity Card Component
interface SortableActivityCardProps {
  item: PlannerItem;
  onRemove: () => void;
  onToggleComplete?: () => void;
}

const SortableActivityCard = ({ item, onRemove, onToggleComplete }: SortableActivityCardProps) => {
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
      <ActivityCard 
        item={item} 
        onRemove={onRemove} 
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
};

// Activity Card Component
interface ActivityCardProps {
  item: PlannerItem;
  isDragging?: boolean;
  onRemove?: () => void;
  onToggleComplete?: () => void;
}

const ActivityCard = ({ item, isDragging, onRemove, onToggleComplete }: ActivityCardProps) => {
  const categoryStyle = getCategoryStyle(item.category);
  const icon = item.icon || getDefaultIcon(item.item_type, item.category);
  
  return (
    <div
      className={cn(
        "p-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all",
        isDragging ? "shadow-xl scale-105 ring-2 ring-primary" : "shadow-sm hover:shadow-md",
        item.completed ? "opacity-60" : "",
        categoryStyle.bg,
        categoryStyle.border
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {/* Complete checkbox */}
          {onToggleComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={cn(
                "mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                item.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-primary"
              )}
            >
              {item.completed && <Check className="w-2 h-2" />}
            </button>
          )}
          
          <span className="text-sm flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <span className={cn(
              "block truncate font-medium",
              categoryStyle.text,
              item.completed && "line-through"
            )}>
              {item.item_name}
            </span>
            
            {/* Category Tag */}
            <span className={cn(
              "inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide",
              categoryStyle.bg,
              categoryStyle.text
            )}>
              {item.category}
            </span>
          </div>
        </div>
        
        {/* Remove button */}
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
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* Metadata */}
      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
        {item.duration && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {item.duration}min
          </span>
        )}
        {item.reservation_confirmed && (
          <span className="flex items-center gap-0.5 text-green-600">
            <Check className="w-2.5 h-2.5" />
            Reservado
          </span>
        )}
        {item.start_time && (
          <span className="flex items-center gap-0.5">
            🕐 {item.start_time}
          </span>
        )}
      </div>

      {item.notes && (
        <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1 italic">
          {item.notes}
        </p>
      )}
    </div>
  );
};

// Helper function for default icons
const getDefaultIcon = (itemType: string, category: string): string => {
  if (itemType === 'park') {
    if (category === 'disney') return '🏰';
    if (category === 'universal') return '⚡';
    if (category === 'seaworld') return '🐬';
    return '🎢';
  }
  if (itemType === 'attraction') return '🎠';
  if (itemType === 'restaurant') return '🍽️';
  if (itemType === 'shopping') {
    if (category === 'outlet') return '🛍️';
    if (category === 'supermarket') return '🛒';
    return '🏬';
  }
  if (itemType === 'activity') return '🌴';
  if (itemType === 'hotel') return '🏨';
  return '📍';
};

export default PlannerCalendar;
