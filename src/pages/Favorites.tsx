import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, UtensilsCrossed, ExternalLink, Trash2, Zap, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { useRestaurantFavorites, useToggleFavorite } from '@/hooks/useRestaurantFavorites';
import { useRestaurantAverageRating } from '@/hooks/useRestaurantReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FavoriteCard = ({ favorite, onRemove }: { 
  favorite: any; 
  onRemove: () => void;
}) => {
  const navigate = useNavigate();
  const restaurant = favorite.restaurants;
  const { data: avgRating } = useRestaurantAverageRating(restaurant?.id || null);

  if (!restaurant) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative">
          <div 
            className="h-48 bg-cover bg-center cursor-pointer"
            style={{ 
              backgroundImage: restaurant.image_url 
                ? `url(${restaurant.image_url})` 
                : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)'
            }}
            onClick={() => navigate(`/restaurante/${restaurant.slug}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {restaurant.character_dining && (
                <Badge className="bg-purple-500/90">
                  <Star className="w-3 h-3 mr-1" />
                  Personagens
                </Badge>
              )}
              {restaurant.michelin && (
                <Badge className="bg-red-500/90">
                  <Star className="w-3 h-3 mr-1" />
                  Michelin
                </Badge>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white mb-1">{restaurant.name}</h3>
              {restaurant.location && (
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {restaurant.location}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {avgRating && avgRating.count > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{avgRating.average.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({avgRating.count})</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Sem avaliações</span>
              )}
            </div>
            {restaurant.price_range && (
              <Badge variant="outline">{restaurant.price_range}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine && (
              <Badge variant="secondary" className="text-xs">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                {restaurant.cuisine}
              </Badge>
            )}
          </div>

          {restaurant.must_try && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              <span className="font-medium text-foreground">Experimente: </span>
              {restaurant.must_try}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1"
              onClick={() => navigate(`/restaurante/${restaurant.slug}`)}
            >
              Ver Detalhes
            </Button>
            {restaurant.website && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(restaurant.website, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AttractionFavoriteCard = ({ pref, onRemove }: {
  pref: { park_name: string; attraction_name: string; notes: string | null };
  onRemove: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center relative">
          <Zap className="w-12 h-12 text-primary/40" />
          <div className="absolute top-3 right-3">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-destructive h-8 w-8"
              onClick={onRemove}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{pref.attraction_name}</h3>
          <Badge variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {pref.park_name}
          </Badge>
          {pref.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{pref.notes}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Favorites = () => {
  const { data: favorites, isLoading } = useRestaurantFavorites();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('restaurants');

  // Fetch attraction preferences (favorites)
  const { data: attractionPrefs, isLoading: attractionsLoading, refetch: refetchAttractions } = useQuery({
    queryKey: ['attraction-preferences', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('attraction_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('park_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleRemoveFavorite = (restaurantId: string, restaurantSlug: string) => {
    toggleFavorite.mutate({
      restaurantId,
      restaurantSlug,
      isFavorite: true,
    });
  };

  const handleRemoveAttraction = async (parkName: string, attractionName: string) => {
    if (!user) return;
    await supabase
      .from('attraction_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('park_name', parkName)
      .eq('attraction_name', attractionName);
    refetchAttractions();
  };

  const restaurantCount = favorites?.length || 0;
  const attractionCount = attractionPrefs?.length || 0;

  return (
    <AppLayout>
      <SEO 
        title="Meus Favoritos | Orlando Fast Pass"
        description="Veja seus restaurantes e atrações favoritas"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              Meus Favoritos
            </h1>
            <p className="text-muted-foreground mt-1">
              Restaurantes e atrações que você salvou
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Restaurantes
              {restaurantCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{restaurantCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Atrações
              {attractionCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{attractionCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && (!favorites || favorites.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nenhum restaurante favorito</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Explore nosso guia de restaurantes e salve seus favoritos.
                </p>
                <Button onClick={() => navigate('/guia-restaurantes')}>
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Explorar Restaurantes
                </Button>
              </motion.div>
            )}

            {!isLoading && favorites && favorites.length > 0 && (
              <>
                <p className="text-muted-foreground mb-4">
                  {favorites.length} {favorites.length === 1 ? 'restaurante salvo' : 'restaurantes salvos'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite) => (
                    <FavoriteCard
                      key={favorite.id}
                      favorite={favorite}
                      onRemove={() => handleRemoveFavorite(
                        favorite.restaurant_id,
                        favorite.restaurants?.slug || ''
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Attractions Tab */}
          <TabsContent value="attractions">
            {attractionsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!attractionsLoading && (!attractionPrefs || attractionPrefs.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Zap className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nenhuma atração selecionada</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Selecione suas atrações favoritas para acessá-las facilmente aqui.
                </p>
                <Button onClick={() => navigate('/atracoes')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Selecionar Atrações
                </Button>
              </motion.div>
            )}

            {!attractionsLoading && attractionPrefs && attractionPrefs.length > 0 && (
              <>
                <p className="text-muted-foreground mb-4">
                  {attractionPrefs.length} {attractionPrefs.length === 1 ? 'atração selecionada' : 'atrações selecionadas'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attractionPrefs.map((pref) => (
                    <AttractionFavoriteCard
                      key={`${pref.park_name}-${pref.attraction_name}`}
                      pref={pref}
                      onRemove={() => handleRemoveAttraction(pref.park_name, pref.attraction_name)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Favorites;
