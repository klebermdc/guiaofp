import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Plane,
  Hotel
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
  items: PlannerItem[];
  parks: string[];
  restaurants: string[];
  completedCount: number;
  totalCount: number;
}

const TripPlannerCard = () => {
  const { user, travelProfile } = useAuth();
  const { t } = useLanguage();

  // Fetch user planner and items
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
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
      let label = format(dateObj, "EEEE, dd/MM", { locale: ptBR });
      
      if (isToday(dateObj)) label = 'Hoje';
      else if (isTomorrow(dateObj)) label = 'Amanhã';
      
      const parks = dayItems.filter(i => i.item_type === 'park').map(i => i.item_name);
      const restaurants = dayItems.filter(i => i.item_type === 'restaurant').map(i => i.item_name);
      
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

  const parkCount = items.filter(i => i.item_type === 'park').length;
  const restaurantCount = items.filter(i => i.item_type === 'restaurant').length;
  const daysWithItems = Object.keys(itemsByDate).length;

  return (
    <Card variant="premium" className="overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 via-secondary/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left Section - Trip Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Plane className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold">{t('dashboard.tripSummary.title')}</h3>
            </div>

            {travelProfile.arrivalDate ? (
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.tripSummary.dates')}</p>
                    <p className="text-sm font-medium">
                      {travelProfile.arrivalDate} - {travelProfile.departureDate}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.tripSummary.parks')}</p>
                    <p className="text-sm font-medium truncate">
                      {travelProfile.parks.length > 0 
                        ? travelProfile.parks.slice(0, 3).join(', ')
                        : t('dashboard.tripSummary.notDefined')
                      }
                      {travelProfile.parks.length > 3 && ` +${travelProfile.parks.length - 3}`}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Hotel className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.tripSummary.hotel')}</p>
                    <p className="text-sm font-medium truncate">
                      {travelProfile.hotel || t('dashboard.tripSummary.notDefined')}
                    </p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  {t('dashboard.tripSummary.fillProfile')}
                </p>
                <Link to="/perfil">
                  <Button variant="outline" size="sm">
                    {t('dashboard.tripSummary.fillNow')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Divider for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-6 bottom-6 w-px bg-border/50" />

          {/* Right Section - Planner Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Meu Roteiro</h3>
              </div>
              <Link to="/planner-manual">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary h-7 text-xs">
                  Ver completo
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {data?.planner ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="text-xs">
                      <span className="font-semibold">{daysWithItems}</span>
                      <span className="text-muted-foreground ml-1">dias</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="text-xs">
                      <span className="font-semibold">{parkCount}</span>
                      <span className="text-muted-foreground ml-1">parques</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                    <Utensils className="w-4 h-4 text-muted-foreground" />
                    <div className="text-xs">
                      <span className="font-semibold">{restaurantCount}</span>
                      <span className="text-muted-foreground ml-1">rest.</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
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

                {/* Upcoming Days */}
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
                          <Badge 
                            variant={day.label === 'Hoje' ? 'default' : 'secondary'}
                            className="text-[10px] px-2 py-0.5 flex-shrink-0"
                          >
                            {day.label === 'Hoje' ? '📍 Hoje' : day.label === 'Amanhã' ? '🔜 Amanhã' : day.label}
                          </Badge>
                          
                          <div className="flex-1 min-w-0">
                            {day.parks.length > 0 && (
                              <p className="text-sm font-medium truncate">
                                {day.parks[0]}
                                {day.parks.length > 1 && (
                                  <span className="text-muted-foreground"> +{day.parks.length - 1}</span>
                                )}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">{day.totalCount} atividades</p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Clock className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Adicione atividades ao roteiro
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-xl border border-dashed border-border">
                <Sparkles className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Crie seu roteiro personalizado
                </p>
                <Link to="/planner-manual">
                  <Button variant="default" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Começar a Planejar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPlannerCard;
