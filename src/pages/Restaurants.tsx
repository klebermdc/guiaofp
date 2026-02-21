import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  UtensilsCrossed, 
  Star,
  Clock,
  Loader2,
  Navigation,
  ExternalLink,
  Filter,
  X,
  ChefHat,
  DollarSign,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RESTAURANT_DETAILS, getTypeLabel, getPriceIndicator } from '@/data/restaurantDetails';
import { PARKS } from '@/data/constants';
import { SEO, SEO_PAGES } from '@/components/SEO';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUserRole } from '@/hooks/useUserRole';
import { useDeleteRestaurant } from '@/hooks/useRestaurants';

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
  image_url: string | null;
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

  const { isGuide } = useUserRole();
  const deleteRestaurantMutation = useDeleteRestaurant();

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

  const handleDeleteRestaurant = async (restaurantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteRestaurantMutation.mutateAsync(restaurantId);
  };

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

  const navigateToRestaurant = (restaurant: Restaurant) => {
    if (restaurant.latitude && restaurant.longitude) {
      navigate(`/mapa?destLat=${restaurant.latitude}&destLng=${restaurant.longitude}&destName=${encodeURIComponent(restaurant.name)}`);
    }
  };

  const getTypeInfo = (restaurant: Restaurant) => {
    if (restaurant.type) {
      return getTypeLabel(restaurant.type);
    }
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
  };

  const getPriceDisplay = (restaurant: Restaurant) => {
    if (restaurant.price_range) {
      return restaurant.price_range;
    }
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details ? getPriceIndicator(details.priceLevel) : '$';
  };

  const getTip = (restaurant: Restaurant) => {
    if (restaurant.tips) return restaurant.tips;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.tip;
  };

  const getMustTry = (restaurant: Restaurant) => {
    if (restaurant.must_try) return restaurant.must_try;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.mustTry;
  };

  const needsReservation = (restaurant: Restaurant) => {
    if (restaurant.reservation_required !== null) return restaurant.reservation_required;
    const details = RESTAURANT_DETAILS[restaurant.name];
    return details?.reservation;
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
                  {parkRestaurants.map(restaurant => {
                    const typeInfo = getTypeInfo(restaurant);
                    const hasCoords = restaurant.latitude && restaurant.longitude;
                    const tip = getTip(restaurant);
                    const mustTry = getMustTry(restaurant);
                    const reservation = needsReservation(restaurant);

                    return (
                      <Card 
                        key={restaurant.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/restaurante/${restaurant.slug}`)}
                      >
                        {/* Restaurant Image */}
                        {restaurant.image_url && (
                          <div className="h-36 overflow-hidden">
                            <img 
                              src={restaurant.image_url}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base truncate">{restaurant.name}</h3>
                              {restaurant.cuisine && (
                                <p className="text-xs text-muted-foreground truncate">{restaurant.cuisine}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge className={`${typeInfo.color} text-white text-xs`}>
                                  {typeInfo.label}
                                </Badge>
                                <span className="text-sm text-green-600 font-medium">
                                  {getPriceDisplay(restaurant)}
                                </span>
                                {reservation && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Reserva
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
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
                              {/* Delete Button - Only for Guides/Admins */}
                              {isGuide && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-destructive hover:bg-destructive/10"
                                      title="Excluir restaurante"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                        Excluir Restaurante
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir <strong>{restaurant.name}</strong>?
                                        <br /><br />
                                        Esta ação é irreversível e irá remover permanentemente o restaurante do sistema.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={(e) => handleDeleteRestaurant(restaurant.id, e)}
                                        disabled={deleteRestaurantMutation.isPending}
                                      >
                                        {deleteRestaurantMutation.isPending ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Excluindo...
                                          </>
                                        ) : (
                                          <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Excluir
                                          </>
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>

                          {tip && (
                            <p className="text-sm text-muted-foreground flex items-start gap-1 line-clamp-2">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
                              {tip}
                            </p>
                          )}

                          {mustTry && (
                            <p className="text-sm font-medium text-primary truncate">
                              🍽️ Experimente: {mustTry}
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
