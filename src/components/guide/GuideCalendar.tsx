import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ParkDate } from '@/types/shared';
import type { Json } from '@/integrations/supabase/types';

// Simplified profile for calendar view
interface CalendarClientProfile {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  park_dates: Json; // Will be parsed as ParkDate[]
  guide_name: string | null;
}

interface DayEvent {
  clientName: string;
  parkName: string;
  guide_name: string | null;
  user_id: string;
}

interface GuideCalendarProps {
  clients: CalendarClientProfile[];
  filterGuide?: string;
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

const PARK_COLORS: Record<string, string> = {
  'Magic Kingdom': 'bg-[hsl(220_70%_45%)]',
  'EPCOT': 'bg-[hsl(280_60%_45%)]',
  'Hollywood Studios': 'bg-[hsl(340_60%_45%)]',
  'Animal Kingdom': 'bg-[hsl(140_60%_35%)]',
  'Universal Studios': 'bg-[hsl(200_70%_45%)]',
  'Islands of Adventure': 'bg-[hsl(30_70%_45%)]',
  'Epic Universe': 'bg-[hsl(260_70%_50%)]',
  'default': 'bg-primary'
};

function getParkColor(parkName: string): string {
  for (const [key, value] of Object.entries(PARK_COLORS)) {
    if (parkName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return PARK_COLORS.default;
}

export function GuideCalendar({ clients, filterGuide = 'all' }: GuideCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Build events map from park_dates
  const getEventsForDay = (day: Date): DayEvent[] => {
    const events: DayEvent[] = [];
    
    clients.forEach(client => {
      // Filter by guide if needed
      if (filterGuide !== 'all') {
        const clientGuide = (client.guide_name || '').toLowerCase().trim();
        if (clientGuide !== filterGuide.toLowerCase()) return;
      }

      // Check park_dates JSON
      if (client.park_dates && Array.isArray(client.park_dates)) {
        client.park_dates.forEach((pd: any) => {
          if (pd.date) {
            try {
              const parkDate = parseISO(pd.date);
              if (isSameDay(parkDate, day)) {
                events.push({
                  clientName: client.responsible_name?.split(' ')[0] || 'Cliente',
                  parkName: pd.park || 'Parque',
                  guide_name: client.guide_name,
                  user_id: client.user_id
                });
              }
            } catch {}
          }
        });
      }
      
      // Fallback: if no park_dates, show client during their trip period
      if ((!client.park_dates || !Array.isArray(client.park_dates) || client.park_dates.length === 0) 
          && client.arrival_date && client.departure_date) {
        try {
          const arrival = parseISO(client.arrival_date);
          const departure = parseISO(client.departure_date);
          if (isWithinInterval(day, { start: arrival, end: departure })) {
            const parks = client.parks || ['Viagem'];
            events.push({
              clientName: client.responsible_name?.split(' ')[0] || 'Cliente',
              parkName: parks[0] || 'Viagem',
              guide_name: client.guide_name,
              user_id: client.user_id
            });
          }
        } catch {}
      }
    });

    return events;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <CardTitle className="text-xl capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 md:p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {days.map((day, idx) => {
            const events = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] md:min-h-[120px] bg-card p-1 md:p-2",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                
                <ScrollArea className="h-[70px] md:h-[85px]">
                  <div className="space-y-1">
                    {events.slice(0, 10).map((event, eventIdx) => (
                      <div
                        key={eventIdx}
                        className={cn(
                          "text-[10px] md:text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity",
                          getParkColor(event.parkName)
                        )}
                        title={`${event.clientName} - ${event.parkName} (clique para abrir)`}
                        onClick={() => navigate(`/admin/cliente/${event.user_id}`)}
                      >
                        <div className="font-medium truncate">{event.clientName}</div>
                        <div className="truncate opacity-80">{event.parkName}</div>
                      </div>
                    ))}
                    {events.length > 10 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{events.length - 10} mais
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
