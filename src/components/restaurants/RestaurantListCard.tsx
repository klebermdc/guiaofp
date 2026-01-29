import React, { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string | null;
  price_range: string | null;
  latitude: number | null;
  longitude: number | null;
  menu_url: string | null;
  tips?: string | null;
  must_try?: string | null;
}

interface TypeInfo {
  label: string;
  color: string;
}

interface RestaurantListCardProps {
  restaurant: Restaurant;
  typeInfo: TypeInfo;
  priceDisplay: string;
  tip: string | undefined;
  mustTry: string | undefined;
  needsReservation: boolean;
  onNavigate: (lat: number, lng: number, name: string) => void;
}

export const RestaurantListCard = memo(function RestaurantListCard({
  restaurant,
  typeInfo,
  priceDisplay,
  tip,
  mustTry,
  needsReservation,
  onNavigate,
}: RestaurantListCardProps) {
  const navigate = useNavigate();
  const hasCoords = restaurant.latitude && restaurant.longitude;

  const handleCardClick = useCallback(() => {
    navigate(`/restaurante/${restaurant.slug}`);
  }, [navigate, restaurant.slug]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.menu_url) {
      window.open(restaurant.menu_url, '_blank');
    }
  }, [restaurant.menu_url]);

  const handleNavigateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.latitude && restaurant.longitude) {
      onNavigate(restaurant.latitude, restaurant.longitude, restaurant.name);
    }
  }, [onNavigate, restaurant.latitude, restaurant.longitude, restaurant.name]);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
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
                {priceDisplay}
              </span>
              {needsReservation && (
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
                onClick={handleMenuClick}
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
                onClick={handleNavigateClick}
                title="Navegar até o restaurante"
              >
                <Navigation className="w-4 h-4" />
              </Button>
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
});

export default RestaurantListCard;
