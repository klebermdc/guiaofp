import { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Check, ChevronLeft, ChevronRight, Star, Pencil, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AttractionsModal } from './AttractionsModal';

interface PlannerItem {
  id: string;
  planner_id: string;
  date: string;
  time_slot: string | null;
  item_type: string;
  item_id?: string;
  item_name: string;
  category: string;
  color: string;
  icon?: string;
  duration?: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  completed?: boolean;
  order_index?: number;
}

interface Planner {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_days: number;
}

interface PlannerCalendarViewProps {
  planner: Planner | null;
  items: PlannerItem[];
  isLoading: boolean;
  onRemoveItem: (itemId: string) => Promise<void>;
  onToggleComplete: (itemId: string) => Promise<void>;
  onReorder: (date: string, timeSlot: string, items: PlannerItem[]) => Promise<void>;
  onAddCustomItem?: (date: string, timeSlot: string, name: string) => Promise<void>;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Manhã', icon: '🌅', hours: '7h - 12h' },
  { id: 'afternoon', label: 'Tarde', icon: '☀️', hours: '12h - 18h' },
  { id: 'evening', label: 'Noite', icon: '🌙', hours: '18h - 23h' },
];

export const PlannerCalendarView = ({
  planner,
  items,
  isLoading,
  onRemoveItem,
  onToggleComplete,
  onReorder,
  onAddCustomItem,
}: PlannerCalendarViewProps) => {
  const [visibleDayIndex, setVisibleDayIndex] = useState(0);

  // Generate days array
  const days = useMemo(() => {
    if (!planner) return [];
    return eachDayOfInterval({
      start: new Date(planner.start_date),
      end: new Date(planner.end_date)
    });
  }, [planner]);

  // Group items by date and time slot
  const groupedItems = useMemo(() => {
    const groups: Record<string, Record<string, PlannerItem[]>> = {};
    
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      groups[dateKey] = {
        morning: [],
        afternoon: [],
        evening: []
      };
    });

    items.forEach(item => {
      const slot = item.time_slot || 'morning';
      if (groups[item.date] && groups[item.date][slot]) {
        groups[item.date][slot].push(item);
      }
    });

    // Sort each group by order_index
    Object.keys(groups).forEach(date => {
      Object.keys(groups[date]).forEach(slot => {
        groups[date][slot].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      });
    });

    return groups;
  }, [days, items]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planner || days.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Nenhum roteiro configurado.</p>
        </CardContent>
      </Card>
    );
  }

  // Mobile: Show one day at a time
  const visibleDays = days.slice(visibleDayIndex, visibleDayIndex + 1);

  return (
    <div className="space-y-4">
      {/* Mobile Navigation */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVisibleDayIndex(Math.max(0, visibleDayIndex - 1))}
          disabled={visibleDayIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          Dia {visibleDayIndex + 1} de {days.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVisibleDayIndex(Math.min(days.length - 1, visibleDayIndex + 1))}
          disabled={visibleDayIndex >= days.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="lg:h-[calc(100vh-220px)]">
        <div className="space-y-6 pb-4">
          {/* Mobile: Single day */}
          <div className="lg:hidden">
            {visibleDays.map(day => (
              <DayColumn
                key={format(day, 'yyyy-MM-dd')}
                day={day}
                dayIndex={visibleDayIndex}
                groupedItems={groupedItems}
                onRemoveItem={onRemoveItem}
                onToggleComplete={onToggleComplete}
                onAddCustomItem={onAddCustomItem}
              />
            ))}
          </div>

          {/* Desktop: All days */}
          <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {days.map((day, index) => (
              <DayColumn
                key={format(day, 'yyyy-MM-dd')}
                day={day}
                dayIndex={index}
                groupedItems={groupedItems}
                onRemoveItem={onRemoveItem}
                onToggleComplete={onToggleComplete}
                onAddCustomItem={onAddCustomItem}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Day Column Component
interface DayColumnProps {
  day: Date;
  dayIndex: number;
  groupedItems: Record<string, Record<string, PlannerItem[]>>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onToggleComplete: (itemId: string) => Promise<void>;
  onAddCustomItem?: (date: string, timeSlot: string, name: string) => Promise<void>;
}

const DayColumn = ({ day, dayIndex, groupedItems, onRemoveItem, onToggleComplete, onAddCustomItem }: DayColumnProps) => {
  const dateKey = format(day, 'yyyy-MM-dd');
  const dayItems = groupedItems[dateKey] || { morning: [], afternoon: [], evening: [] };
  const totalItems = Object.values(dayItems).flat().length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              Dia {dayIndex + 1}
            </CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {format(day, 'EEEE, dd/MM', { locale: ptBR })}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border">
        {TIME_SLOTS.map(slot => (
          <TimeSlotDropZone
            key={slot.id}
            date={dateKey}
            slot={slot}
            items={dayItems[slot.id] || []}
            onRemoveItem={onRemoveItem}
            onToggleComplete={onToggleComplete}
            onAddCustomItem={onAddCustomItem}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Time Slot Drop Zone Component
interface TimeSlotDropZoneProps {
  date: string;
  slot: typeof TIME_SLOTS[number];
  items: PlannerItem[];
  onRemoveItem: (itemId: string) => Promise<void>;
  onToggleComplete: (itemId: string) => Promise<void>;
  onAddCustomItem?: (date: string, timeSlot: string, name: string) => Promise<void>;
}

const TimeSlotDropZone = ({ date, slot, items, onRemoveItem, onToggleComplete, onAddCustomItem }: TimeSlotDropZoneProps) => {
  const dropId = `date-${date}-slot-${slot.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  const [isAdding, setIsAdding] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleAddCustom = async () => {
    if (!customName.trim() || !onAddCustomItem) return;
    await onAddCustomItem(date, slot.id, customName.trim());
    setCustomName('');
    setIsAdding(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-3 min-h-[100px] transition-colors',
        isOver && 'bg-primary/10 ring-2 ring-primary ring-inset'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{slot.icon}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {slot.label}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {slot.hours}
        </span>
        <div className="ml-auto">
          {onAddCustomItem && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
              title="Adicionar item personalizado"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline custom item input */}
      {isAdding && (
        <div className="flex items-center gap-1.5 mb-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Nome da atividade..."
            className="h-7 text-xs flex-1"
            autoFocus
          />
          <button
            onClick={handleAddCustom}
            disabled={!customName.trim()}
            className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setIsAdding(false); setCustomName(''); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {items.length === 0 && !isAdding ? (
        <div className="h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Arraste itens aqui
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <PlannerItemCard
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
              onToggleComplete={() => onToggleComplete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Planner Item Card
interface PlannerItemCardProps {
  item: PlannerItem;
  onRemove: () => void;
  onToggleComplete: () => void;
}

const PlannerItemCard = ({ item, onRemove, onToggleComplete }: PlannerItemCardProps) => {
  const [attractionsModalOpen, setAttractionsModalOpen] = useState(false);
  
  // Check if this is a park item
  const isPark = item.item_type === 'park';

  return (
    <>
      <div
        className={cn(
          'group p-2 rounded-lg border transition-all',
          item.completed 
            ? 'bg-muted/50 border-muted opacity-60' 
            : 'bg-background border-border hover:shadow-sm'
        )}
        style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={onToggleComplete}
            className={cn(
              'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
              item.completed
                ? 'bg-success border-success text-success-foreground'
                : 'border-muted-foreground/30 hover:border-primary'
            )}
          >
            {item.completed && <Check className="w-2.5 h-2.5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm">{item.icon || '📍'}</span>
              <span className={cn(
                'text-sm font-medium truncate',
                item.completed && 'line-through'
              )}>
                {item.item_name}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              {item.start_time && (
                <span className="text-[10px] text-muted-foreground">
                  ⏰ {item.start_time}
                </span>
              )}
              {item.duration && (
                <span className="text-[10px] text-muted-foreground">
                  ⏱️ {item.duration}min
                </span>
              )}
            </div>
            
            {/* Button to select attractions for park items */}
            {isPark && !item.completed && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs w-full gap-1 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttractionsModalOpen(true);
                }}
              >
                <Star className="h-3 w-3" />
                Escolher Atrações
              </Button>
            )}
          </div>

          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Attractions Modal */}
      {isPark && (
        <AttractionsModal
          open={attractionsModalOpen}
          onOpenChange={setAttractionsModalOpen}
          parkName={item.item_name}
        />
      )}
    </>
  );
};

export default PlannerCalendarView;
