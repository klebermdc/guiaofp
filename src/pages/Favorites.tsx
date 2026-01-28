import { motion } from 'framer-motion';
import { Heart, MapPin, Star, UtensilsCrossed, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { useRestaurantFavorites, useToggleFavorite } from '@/hooks/useRestaurantFavorites';
import { useRestaurantAverageRating } from '@/hooks/useRestaurantReviews';

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
            
            {/* Quick action buttons */}
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

            {/* Badges */}
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

            {/* Title overlay */}
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
          {/* Rating and Price */}
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

          {/* Cuisine & Category */}
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine && (
              <Badge variant="secondary" className="text-xs">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                {restaurant.cuisine}
              </Badge>
            )}
            {restaurant.subcategory && (
              <Badge variant="outline" className="text-xs">
                {restaurant.subcategory}
              </Badge>
            )}
          </div>

          {/* Must Try */}
          {restaurant.must_try && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              <span className="font-medium text-foreground">Experimente: </span>
              {restaurant.must_try}
            </p>
          )}

          {/* Actions */}
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

const Favorites = () => {
  const { data: favorites, isLoading } = useRestaurantFavorites();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();

  const handleRemoveFavorite = (restaurantId: string, restaurantSlug: string) => {
    toggleFavorite.mutate({
      restaurantId,
      restaurantSlug,
      isFavorite: true, // It's currently favorited, so we're removing
    });
  };

  return (
    <AppLayout>
      <SEO 
        title="Meus Favoritos | Orlando Fast Pass"
        description="Veja seus restaurantes favoritos salvos"
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
              Restaurantes que você salvou para visitar
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/guia-restaurantes')}
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Explorar Mais
          </Button>
        </div>

        {/* Loading State */}
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

        {/* Empty State */}
        {!isLoading && (!favorites || favorites.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore nosso guia de restaurantes e salve seus favoritos para acessá-los facilmente aqui.
            </p>
            <Button onClick={() => navigate('/guia-restaurantes')}>
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Explorar Restaurantes
            </Button>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites && favorites.length > 0 && (
          <>
            <p className="text-muted-foreground">
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
      </div>
    </AppLayout>
  );
};

export default Favorites;
