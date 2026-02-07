import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Award,
  Heart
} from 'lucide-react';
import { type Restaurant } from '@/data/restaurantsData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useFavoriteSlugs, useToggleFavorite, getRestaurantIdBySlug } from '@/hooks/useRestaurantFavorites';
import { useAuth } from '@/contexts/AuthContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: favoriteSlugs } = useFavoriteSlugs();
  const toggleFavorite = useToggleFavorite();
  
  const isFavorite = favoriteSlugs?.has(restaurant.id) || false;

  const getPriceColor = (price: string) => {
    switch (price) {
      case '$': return 'text-green-600 bg-green-100';
      case '$$': return 'text-blue-600 bg-blue-100';
      case '$$$': return 'text-purple-600 bg-purple-100';
      case '$$$$': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'disney':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">🏰 Disney</Badge>;
      case 'universal':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">🎬 Universal</Badge>;
      case 'fora-parques':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">🍽️ Fora dos Parques</Badge>;
      default:
        return null;
    }
  };

  // The restaurant.id is now the slug from the database
  const restaurantSlug = restaurant.id;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const restaurantId = await getRestaurantIdBySlug(restaurant.id);
    if (!restaurantId) return;

    toggleFavorite.mutate({
      restaurantId,
      restaurantSlug: restaurant.id,
      isFavorite,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => navigate(`/restaurante/${restaurantSlug}`)}>
      {/* Imagem do Restaurante - Compacta */}
      <div className="relative h-36 overflow-hidden">
        <img 
          src={restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
          }}
        />
        
        {/* Badges sobre a imagem */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {getCategoryBadge(restaurant.category)}
          {restaurant.michelin && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-1.5 py-0.5">
              <Award className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {/* Botão de Favorito */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
          disabled={toggleFavorite.isPending}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Conteúdo do Card - Compacto */}
      <CardContent className="p-4">
        {/* Título e Preço */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
            {restaurant.name}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${getPriceColor(restaurant.priceRange)}`}>
            {restaurant.priceRange}
          </span>
        </div>

        {/* Localização */}
        {restaurant.address && (
          <div className="flex items-center text-muted-foreground text-xs mb-2">
            <MapPin className="w-3 h-3 mr-1 shrink-0 text-primary" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
        )}

        {/* Descrição curta */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {restaurant.description}
        </p>

        {/* Highlights - máximo 2 */}
        {restaurant.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.highlights.slice(0, 2).map((highlight, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs px-2 py-0.5"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer com reserva */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          {restaurant.reservations ? (
            <span className="flex items-center text-green-600">
              <Clock className="w-3 h-3 mr-1" />
              Reserva
            </span>
          ) : (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Sem reserva
            </span>
          )}
          <span className="text-primary font-medium">Ver detalhes →</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
