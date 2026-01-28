import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  UtensilsCrossed, 
  Star,
  Clock,
  DollarSign,
  Loader2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RESTAURANT_DETAILS, getTypeLabel, getPriceIndicator } from '@/data/restaurantDetails';
import { PARKS } from '@/data/constants';
import { SEO, SEO_PAGES } from '@/components/SEO';

interface Restaurant {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  latitude: number | null;
  longitude: number | null;
  menu_url: string | null;
  park_name?: string;
}

// Extended parks with emojis for display
const PARKS_WITH_EMOJI = PARKS.map(park => ({
  ...park,
  emoji: park.name === 'Magic Kingdom' ? '🏰' :
         park.name === 'EPCOT' ? '🌍' :
         park.name === 'Hollywood Studios' ? '🎬' :
         park.name === 'Animal Kingdom' ? '🦁' :
         park.name === 'Universal Studios' ? '🎢' :
         park.name === 'Islands of Adventure' ? '🏝️' :
         park.name === 'Epic Universe' ? '🌌' : '🎡'
}));

const Restaurants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('all');

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, category_id, latitude, longitude, menu_url')
        .eq('type', 'poi')
        .eq('icon', 'restaurant')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      
      // Add park name to each restaurant
      return (data || []).map(r => {
        const park = PARKS_WITH_EMOJI.find(p => p.id === r.category_id);
        return { ...r, park_name: park?.name || 'Unknown' };
      });
    },
  });

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPark = selectedPark === 'all' || r.category_id === selectedPark;
      return matchesSearch && matchesPark;
    });
  }, [restaurants, searchTerm, selectedPark]);

  const groupedByPark = useMemo(() => {
    const groups: Record<string, Restaurant[]> = {};
    PARKS.forEach(park => {
      const parkRestaurants = filteredRestaurants.filter(r => r.category_id === park.id);
      if (parkRestaurants.length > 0) {
        groups[park.id] = parkRestaurants;
      }
    });
    return groups;
  }, [filteredRestaurants]);

  const navigateToRestaurant = (restaurant: Restaurant) => {
    if (restaurant.latitude && restaurant.longitude) {
      // Navigate to map with destination
      navigate(`/mapa?destLat=${restaurant.latitude}&destLng=${restaurant.longitude}&destName=${encodeURIComponent(restaurant.title)}`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO {...SEO_PAGES.restaurants} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Restaurantes</h1>
            <p className="text-muted-foreground">Guia completo de onde comer nos parques</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar restaurante..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedPark === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setSelectedPark('all')}
          >
            Todos ({restaurants.length})
          </Badge>
          {PARKS_WITH_EMOJI.map(park => {
            const count = restaurants.filter(r => r.category_id === park.id).length;
            if (count === 0) return null;
            return (
              <Badge
                key={park.id}
                variant={selectedPark === park.id ? 'default' : 'secondary'}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setSelectedPark(selectedPark === park.id ? 'all' : park.id)}
              >
                {park.emoji} {park.name} ({count})
              </Badge>
            );
          })}
        </div>

        {/* Restaurant List by Park */}
        <div className="space-y-6">
          {Object.entries(groupedByPark).map(([parkId, parkRestaurants]) => {
            const park = PARKS_WITH_EMOJI.find(p => p.id === parkId);
            if (!park) return null;

            return (
              <div key={parkId} className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">{park.emoji}</span>
                  {park.name}
                  <Badge variant="outline" className="ml-2">{parkRestaurants.length}</Badge>
                </h2>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {parkRestaurants.map(restaurant => {
                    const details = RESTAURANT_DETAILS[restaurant.title];
                    const typeInfo = details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
                    const hasCoords = restaurant.latitude && restaurant.longitude;

                    return (
                      <Card 
                        key={restaurant.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base truncate">{restaurant.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${typeInfo.color} text-white text-xs`}>
                                  {typeInfo.label}
                                </Badge>
                                {details && (
                                  <span className="text-sm text-green-600 font-medium">
                                    {getPriceIndicator(details.priceLevel)}
                                  </span>
                                )}
                                {details?.reservation && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Reserva
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {restaurant.menu_url && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-orange-500 hover:bg-orange-500/10"
                                  onClick={() => window.open(restaurant.menu_url!, '_blank')}
                                  title="Ver menu virtual"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                              {hasCoords && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-primary hover:bg-primary/10"
                                  onClick={() => navigateToRestaurant(restaurant)}
                                  title="Navegar até o restaurante"
                                >
                                  <Navigation className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {details?.tip && (
                            <p className="text-sm text-muted-foreground flex items-start gap-1">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
                              {details.tip}
                            </p>
                          )}

                          {details?.mustTry && (
                            <p className="text-sm font-medium text-primary">
                              🍽️ Experimente: {details.mustTry}
                            </p>
                          )}

                          {!hasCoords && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Localização pendente
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;
