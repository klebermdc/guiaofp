import { useState } from 'react';
import { MapPin, Phone, Star, ExternalLink, Clock, ChevronDown, ChevronUp, UtensilsCrossed, Award } from 'lucide-react';
import { type Restaurant } from '@/data/restaurantsFullData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getPriceColor = (price: string) => {
    switch (price) {
      case '$': return 'bg-green-500/10 text-green-600';
      case '$$': return 'bg-blue-500/10 text-blue-600';
      case '$$$': return 'bg-purple-500/10 text-purple-600';
      case '$$$$': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'disney': return { label: '🏰 Disney', color: 'bg-blue-500' };
      case 'universal': return { label: '🎬 Universal', color: 'bg-purple-500' };
      case 'fora-parques': return { label: '🍽️ Fora dos Parques', color: 'bg-green-500' };
      default: return { label: 'Restaurante', color: 'bg-muted' };
    }
  };

  const categoryBadge = getCategoryBadge(restaurant.category);

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-border/50">
      {/* Image */}
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={restaurant.images[currentImageIndex]} 
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge className={`${categoryBadge.color} text-white text-xs`}>{categoryBadge.label}</Badge>
          {restaurant.featured && (
            <Badge className="bg-orange-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1 fill-white" /> Destaque
            </Badge>
          )}
          {restaurant.michelin && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
              <Award className="w-3 h-3 mr-1" /> Michelin
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-foreground leading-tight line-clamp-2">{restaurant.name}</h3>
          <Badge className={getPriceColor(restaurant.priceRange)}>{restaurant.priceRange}</Badge>
        </div>

        <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>

        {restaurant.phone && (
          <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-4 h-4 text-primary" />
            {restaurant.phone}
          </a>
        )}

        <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-3'}`}>
          {restaurant.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5">
          {restaurant.highlights.slice(0, isExpanded ? undefined : 3).map((h, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{h}</Badge>
          ))}
        </div>

        {/* Menu (expanded) */}
        {isExpanded && restaurant.menu && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <UtensilsCrossed className="w-4 h-4 text-primary" /> Menu
            </div>
            {restaurant.menu.mainCourses && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Pratos:</span> {restaurant.menu.mainCourses.slice(0, 4).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" className="flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <><ChevronUp className="w-4 h-4 mr-1" /> Menos</> : <><ChevronDown className="w-4 h-4 mr-1" /> Mais</>}
          </Button>
          {restaurant.website && (
            <Button variant="outline" size="icon" asChild>
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {restaurant.reservations ? 'Aceita reservas' : 'Sem reservas'}
        </div>
      </div>
    </div>
  );
};
