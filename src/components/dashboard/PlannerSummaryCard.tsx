import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Utensils, CheckCircle2, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlannerItem {
  id: string;
  date: string;
  time_slot: string;
  item_type: string;
  item_name: string;
  icon: string | null;
  completed: boolean | null;
}

interface DaySummary {
  date: string;
  label: string;
  items: PlannerItem[];
  parks: string[];
  restaurants: string[];
  completedCount: number;
  totalCount: number;
}

const PlannerSummaryCard = () => {
  const { user } = useAuth();

  // Fetch user planner and items
  const { data, isLoading } = useQuery({
    queryKey: ['planner-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get active planner
      const { data: planner } = await supabase
        .from('user_planners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!planner) return null;

      // Get all planner items
      const { data: items } = await supabase
        .from('planner_items')
        .select('id, date, time_slot, item_type, item_name, icon, completed')
        .eq('planner_id', planner.id)
        .order('date', { ascending: true })
        .order('order_index', { ascending: true });

      return { planner, items: items || [] };
    },
    enabled: !!user?.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.planner) {
    return (
      <Card variant="glass" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Planejador de Roteiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Crie seu roteiro personalizado arrastando parques, restaurantes e atividades.
          </p>
          <Link to="/planner-manual">
            <Button variant="default" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Começar a Planejar
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { planner, items } = data;
  const today = new Date();

  // Calculate overall stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Group items by date and get next 3 relevant days
  const itemsByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, PlannerItem[]>);

  // Get day summaries for upcoming days
  const upcomingDays: DaySummary[] = Object.entries(itemsByDate)
    .filter(([date]) => new Date(date) >= new Date(format(today, 'yyyy-MM-dd')))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 3)
    .map(([date, dayItems]) => {
      const dateObj = new Date(date + 'T12:00:00');
      let label = format(dateObj, "EEEE, dd/MM", { locale: ptBR });
      
      if (isToday(dateObj)) label = 'Hoje';
      else if (isTomorrow(dateObj)) label = 'Amanhã';
      
      const parks = dayItems
        .filter(i => i.item_type === 'park')
        .map(i => i.item_name);
      
      const restaurants = dayItems
        .filter(i => i.item_type === 'restaurant')
        .map(i => i.item_name);
      
      return {
        date,
        label,
        items: dayItems,
        parks,
        restaurants,
        completedCount: dayItems.filter(i => i.completed).length,
        totalCount: dayItems.length,
      };
    });

  // Count by type
  const parkCount = items.filter(i => i.item_type === 'park').length;
  const restaurantCount = items.filter(i => i.item_type === 'restaurant').length;
  const daysWithItems = Object.keys(itemsByDate).length;

  return (
    <Card variant="glass" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Meu Roteiro
          </CardTitle>
          <Link to="/planner-manual">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
              Ver completo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">{daysWithItems}</span>
              <span className="text-muted-foreground ml-1">dias</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">{parkCount}</span>
              <span className="text-muted-foreground ml-1">parques</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Utensils className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">{restaurantCount}</span>
              <span className="text-muted-foreground ml-1">rest.</span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        {totalItems > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Progresso geral
              </span>
              <span className="font-medium">{completedItems}/{totalItems}</span>
            </div>
            <Progress value={completionPercent} className="h-1.5" />
          </div>
        )}

        {/* Upcoming Days Preview */}
        {upcomingDays.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Próximos dias
            </h4>
            <div className="space-y-2">
              {upcomingDays.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => window.location.href = '/planner-manual'}
                >
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={day.label === 'Hoje' ? 'default' : 'secondary'}
                      className="text-[10px] px-2 py-0.5"
                    >
                      {day.label === 'Hoje' ? '📍 Hoje' : day.label === 'Amanhã' ? '🔜 Amanhã' : day.label}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {day.parks.length > 0 && (
                      <p className="text-sm font-medium truncate">
                        {day.parks[0]}
                        {day.parks.length > 1 && (
                          <span className="text-muted-foreground"> +{day.parks.length - 1}</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{day.totalCount} atividades</span>
                      {day.completedCount > 0 && (
                        <span className="text-success flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {day.completedCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Adicione atividades ao seu roteiro
            </p>
            <Link to="/planner-manual">
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <Sparkles className="w-4 h-4" />
                Montar Roteiro
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlannerSummaryCard;
