import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Utensils, Loader2, MapPin, Star, CalendarCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryData {
  selectedParks: string[];
  budget: string;
  adultsCount: number;
  childrenCount: number;
  travelStyle: string;
}

interface RestaurantRecommendation {
  name: string;
  park: string;
  cuisine: string;
  priceLevel: string;
  priceRange: string;
  requiresReservation: boolean;
  mustTry: string;
  tips: string;
  imageEmoji: string;
}

interface RestaurantSuggestionsProps {
  itineraryData: ItineraryData;
}

export const RestaurantSuggestions = ({ itineraryData }: RestaurantSuggestionsProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('suggest-restaurants', {
          body: { itineraryData }
        });

        if (fnError) throw fnError;
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error('Error fetching restaurant suggestions:', err);
        setError('Não foi possível carregar as sugestões de restaurantes.');
      } finally {
        setIsLoading(false);
      }
    };

    if (itineraryData.selectedParks?.length > 0) {
      fetchSuggestions();
    } else {
      setIsLoading(false);
    }
  }, [itineraryData]);

  if (isLoading) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Buscando restaurantes para seu perfil...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/30">
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <p className="text-muted-foreground text-center">
          Selecione parques no passo anterior para ver sugestões de restaurantes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 p-5 rounded-xl border border-border space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Utensils className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            Sugestões de Restaurantes
          </h3>
          <p className="text-sm text-muted-foreground">
            Baseado nos parques selecionados e seu orçamento
          </p>
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-3">
        {restaurants.map((restaurant, idx) => (
          <div 
            key={idx} 
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            {/* Restaurant Header */}
            <button
              type="button"
              onClick={() => setExpandedRestaurant(expandedRestaurant === idx ? null : idx)}
              className="w-full p-4 text-left flex items-start gap-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-3xl">{restaurant.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{restaurant.name}</h4>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    restaurant.priceLevel === "$$$$" ? "bg-amber-500/20 text-amber-600" :
                    restaurant.priceLevel === "$$$" ? "bg-primary/10 text-primary" :
                    "bg-green-500/20 text-green-600"
                  )}>
                    {restaurant.priceLevel}
                  </span>
                  {restaurant.requiresReservation && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      Reserva
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{restaurant.park}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="truncate">{restaurant.cuisine}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-foreground font-medium">
                    {restaurant.priceRange}
                  </span>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedRestaurant === idx && (
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                {/* Must Try */}
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Prato Imperdível
                    </span>
                    <p className="text-sm text-foreground mt-1">{restaurant.mustTry}</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Dica do Guia
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{restaurant.tips}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="bg-primary/5 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          💡 Dica: Restaurantes com reserva devem ser agendados com 60 dias de antecedência pelo app My Disney Experience ou Universal Orlando.
        </p>
      </div>
    </div>
  );
};
