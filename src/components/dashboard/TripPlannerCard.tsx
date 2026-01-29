import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Utensils, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Plane,
  Hotel,
  Clock
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  parks: string[];
  totalCount: number;
}

const TripPlannerCard = () => {
  const { user, travelProfile } = useAuth();
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['planner-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: planner } = await supabase
        .from('user_planners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!planner) return null;

      const { data: items } = await supabase
        .from('planner_items')
        .select('id, date, time_slot, item_type, item_name, icon, completed')
        .eq('planner_id', planner.id)
        .order('date', { ascending: true })
        .order('order_index', { ascending: true });

      return { planner, items: items || [] };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <Card variant="premium" className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = data?.items || [];
  const today = new Date();

  // Planner stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const itemsByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, PlannerItem[]>);

  const upcomingDays: DaySummary[] = Object.entries(itemsByDate)
    .filter(([date]) => new Date(date) >= new Date(format(today, 'yyyy-MM-dd')))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 3)
    .map(([date, dayItems]) => {
      const dateObj = new Date(date + 'T12:00:00');
      let label = format(dateObj, "EEE, dd/MM", { locale: ptBR });
      
      if (isToday(dateObj)) label = 'Hoje';
      else if (isTomorrow(dateObj)) label = 'Amanhã';
      
      const parks = dayItems.filter(i => i.item_type === 'park').map(i => i.item_name);
      
      return {
        date,
        label,
        parks,
        totalCount: dayItems.length,
      };
    });

  const parkCount = items.filter(i => i.item_type === 'park').length;
  const restaurantCount = items.filter(i => i.item_type === 'restaurant').length;
  const daysWithItems = Object.keys(itemsByDate).length;

  const hasPlanner = !!data?.planner;
  const hasTripData = !!travelProfile.arrivalDate;

  // If no data at all, show empty state
  if (!hasTripData && !hasPlanner) {
    return (
      <Card variant="premium" className="overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">Planeje sua Viagem</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete seu perfil e crie seu roteiro personalizado
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/perfil">
                <Button variant="outline" size="sm">
                  Preencher Perfil
                </Button>
              </Link>
              <Link to="/planner-manual">
                <Button size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Criar Roteiro
                </Button>
              </Link>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="premium" className="overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 via-secondary/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              <Plane className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="font-display text-lg font-semibold">Minha Viagem</h3>
          </div>
          <Link to="/planner-manual">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary h-7 text-xs">
              Ver roteiro
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div 
            className="p-3 bg-muted/50 rounded-xl border border-border/50 space-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Datas</span>
            </div>
            <p className="text-sm font-medium truncate">
              {hasTripData 
                ? `${travelProfile.arrivalDate?.slice(5)} → ${travelProfile.departureDate?.slice(5)}`
                : 'Não definido'
              }
            </p>
          </motion.div>

          <motion.div 
            className="p-3 bg-muted/50 rounded-xl border border-border/50 space-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hotel className="w-4 h-4" />
              <span className="text-xs">Hotel</span>
            </div>
            <p className="text-sm font-medium truncate">
              {travelProfile.hotel || 'Não definido'}
            </p>
          </motion.div>

          <motion.div 
            className="p-3 bg-muted/50 rounded-xl border border-border/50 space-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Parques</span>
            </div>
            <p className="text-sm font-medium">
              {hasPlanner ? parkCount : travelProfile.parks.length} selecionados
            </p>
          </motion.div>

          <motion.div 
            className="p-3 bg-muted/50 rounded-xl border border-border/50 space-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Utensils className="w-4 h-4" />
              <span className="text-xs">Restaurantes</span>
            </div>
            <p className="text-sm font-medium">{restaurantCount} no roteiro</p>
          </motion.div>
        </div>

        {/* Progress Bar (if planner exists) */}
        {hasPlanner && totalItems > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Progresso do roteiro
              </span>
              <span className="font-medium">{completedItems}/{totalItems} ({completionPercent}%)</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        )}

        {/* Upcoming Days */}
        {upcomingDays.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Próximos dias
            </h4>
            <div className="flex flex-wrap gap-2">
              {upcomingDays.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors cursor-pointer"
                  onClick={() => window.location.href = '/planner-manual'}
                >
                  <Badge 
                    variant={day.label === 'Hoje' ? 'default' : 'secondary'}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {day.label === 'Hoje' ? '📍' : day.label === 'Amanhã' ? '🔜' : '📅'} {day.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {day.parks[0] ? day.parks[0].split(' ')[0] : `${day.totalCount} ativ.`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty planner state */}
        {!hasPlanner && (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Monte seu roteiro dia a dia</span>
            </div>
            <Link to="/planner-manual">
              <Button size="sm" variant="default" className="h-7 text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                Criar
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripPlannerCard;
