import { useState, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  UtensilsCrossed, 
  Loader2,
  Filter,
  X,
  ChefHat,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { RESTAURANT_DETAILS, getTypeLabel, getPriceIndicator } from '@/data/restaurantDetails';
import { PARKS } from '@/data/constants';
import { SEO, SEO_PAGES } from '@/components/SEO';
import { RestaurantListCard } from '@/components/restaurants/RestaurantListCard';
import { RestaurantListSkeleton } from '@/components/restaurants/RestaurantListSkeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string | null;
  price_range: string | null;
  park_id: string | null;
  latitude: number | null;
  longitude: number | null;
  menu_url: string | null;
  reservation_required: boolean | null;
  type: string | null;
  featured: boolean | null;
  character_dining: boolean | null;
  michelin: boolean | null;
  tips: string | null;
  must_try: string | null;
  area: string | null;
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

// Cuisine types available
const CUISINE_TYPES = [
  { value: 'all', label: 'Todas as Culinárias', icon: '🍽️' },
  { value: 'americana', label: 'Americana', icon: '🍔' },
  { value: 'italiana', label: 'Italiana', icon: '🍝' },
  { value: 'mexicana', label: 'Mexicana', icon: '🌮' },
  { value: 'japonesa', label: 'Japonesa', icon: '🍣' },
  { value: 'chinesa', label: 'Chinesa', icon: '🥡' },
  { value: 'asiática', label: 'Asiática', icon: '🍜' },
  { value: 'britânica', label: 'Britânica', icon: '🇬🇧' },
  { value: 'francesa', label: 'Francesa', icon: '🥐' },
  { value: 'africana', label: 'Africana', icon: '🌍' },
  { value: 'churrasco', label: 'Churrasco/BBQ', icon: '🍖' },
  { value: 'frutos-do-mar', label: 'Frutos do Mar', icon: '🦞' },
  { value: 'sobremesas', label: 'Sobremesas', icon: '🍰' },
  { value: 'variada', label: 'Variada/Fusion', icon: '🌎' },
];

// Price range options
const PRICE_RANGES = [
  { value: 'all', label: 'Todos os Preços', indicator: '💰' },
  { value: '$', label: 'Econômico', indicator: '$' },
  { value: '$$', label: 'Moderado', indicator: '$$' },
  { value: '$$$', label: 'Caro', indicator: '$$$' },
  { value: '$$$$', label: 'Premium', indicator: '$$$$' },
];

// Service type options
const SERVICE_TYPES = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'quick-service', label: 'Quick Service' },
  { value: 'table-service', label: 'Mesa' },
  { value: 'signature', label: 'Signature' },
];

const Restaurants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as Restaurant[];
    },
  });

  // Extract unique cuisines from database
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    restaurants.forEach(r => {
      if (r.cuisine) {
        cuisines.add(r.cuisine.toLowerCase());
      }
    });
    return cuisines;
  }, [restaurants]);

  const hasActiveFilters = selectedCuisine !== 'all' || selectedPrice !== 'all' || selectedType !== 'all';

  const clearFilters = () => {
    setSelectedCuisine('all');
    setSelectedPrice('all');
    setSelectedType('all');
    setSelectedPark('all');
    setSearchTerm('');
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // Search filter
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                           (r.area?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      // Park filter
      const matchesPark = selectedPark === 'all' || r.park_id === selectedPark;
      
      // Cuisine filter
      const matchesCuisine = selectedCuisine === 'all' || 
                            r.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase());
      
      // Price filter
      const matchesPrice = selectedPrice === 'all' || r.price_range === selectedPrice;
      
      // Type filter
      const matchesType = selectedType === 'all' || r.type === selectedType;
      
      return matchesSearch && matchesPark && matchesCuisine && matchesPrice && matchesType;
    });
  }, [restaurants, searchTerm, selectedPark, selectedCuisine, selectedPrice, selectedType]);

  const groupedByPark = useMemo(() => {
    const groups: Record<string, Restaurant[]> = {};
    
    // Get unique park IDs from filtered restaurants
    const parkIds = [...new Set(filteredRestaurants.map(r => r.park_id).filter(Boolean))];
    
    parkIds.forEach(parkId => {
      if (parkId) {
        const parkRestaurants = filteredRestaurants.filter(r => r.park_id === parkId);
        if (parkRestaurants.length > 0) {
          groups[parkId] = parkRestaurants;
        }
      }
    });
    
    // Add restaurants without park_id
    const noParkRestaurants = filteredRestaurants.filter(r => !r.park_id);
    if (noParkRestaurants.length > 0) {
      groups['other'] = noParkRestaurants;
    }
    
    return groups;
  }, [filteredRestaurants]);

  const handleNavigate = useCallback((lat: number, lng: number, name: string) => {
    navigate(`/mapa?destLat=${lat}&destLng=${lng}&destName=${encodeURIComponent(name)}`);
  }, [navigate]);

  const getTypeInfo = useCallback((restaurant: Restaurant) => {
    if (restaurant.type) {
      return getTypeLabel(restaurant.type);
    }
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
  }, []);

  const getPriceDisplay = useCallback((restaurant: Restaurant) => {
    if (restaurant.price_range) {
      return restaurant.price_range;
    }
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details ? getPriceIndicator(details.priceLevel) : '$';
  }, []);

  const getTip = useCallback((restaurant: Restaurant): string | undefined => {
    if (restaurant.tips) return restaurant.tips;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.tip;
  }, []);

  const getMustTry = useCallback((restaurant: Restaurant): string | undefined => {
    if (restaurant.must_try) return restaurant.must_try;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.mustTry;
  }, []);

  const needsReservation = useCallback((restaurant: Restaurant) => {
    if (restaurant.reservation_required !== null) return restaurant.reservation_required;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.reservation ?? false;
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <SEO {...SEO_PAGES.restaurants} />
        <RestaurantListSkeleton />
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
            <p className="text-muted-foreground">
              {filteredRestaurants.length} restaurantes encontrados
            </p>
          </div>
        </div>

        {/* Search & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, culinária ou área..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {[selectedCuisine !== 'all', selectedPrice !== 'all', selectedType !== 'all'].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-4 bg-muted/30">
            <div className="flex flex-wrap gap-4">
              {/* Cuisine Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Culinária
                </label>
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_TYPES.map(cuisine => (
                      <SelectItem key={cuisine.value} value={cuisine.value}>
                        <span className="flex items-center gap-2">
                          <span>{cuisine.icon}</span>
                          {cuisine.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Faixa de Preço
                </label>
                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map(price => (
                      <SelectItem key={price.value} value={price.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">{price.indicator}</span>
                          {price.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Tipo de Serviço
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="w-4 h-4" />
                    Limpar
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Park Filter Badges */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <Badge 
              variant={selectedPark === 'all' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 shrink-0"
              onClick={() => setSelectedPark('all')}
            >
              Todos ({restaurants.length})
            </Badge>
            {PARKS_WITH_EMOJI.map(park => {
              const count = restaurants.filter(r => r.park_id === park.id).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={park.id}
                  variant={selectedPark === park.id ? 'default' : 'secondary'}
                  className="cursor-pointer px-3 py-1.5 shrink-0"
                  onClick={() => setSelectedPark(selectedPark === park.id ? 'all' : park.id)}
                >
                  {park.emoji} {park.name} ({count})
                </Badge>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Restaurant List by Park */}
        <div className="space-y-6">
          {Object.entries(groupedByPark).map(([parkId, parkRestaurants]) => {
            const park = PARKS_WITH_EMOJI.find(p => p.id === parkId);
            const parkName = park?.name || 'Outros Locais';
            const parkEmoji = park?.emoji || '📍';

            return (
              <div key={parkId} className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">{parkEmoji}</span>
                  {parkName}
                  <Badge variant="outline" className="ml-2">{parkRestaurants.length}</Badge>
                </h2>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {parkRestaurants.map(restaurant => (
                    <RestaurantListCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      typeInfo={getTypeInfo(restaurant)}
                      priceDisplay={getPriceDisplay(restaurant)}
                      tip={getTip(restaurant)}
                      mustTry={getMustTry(restaurant)}
                      needsReservation={needsReservation(restaurant)}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;
