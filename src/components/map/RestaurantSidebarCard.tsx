import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, Star, Clock, UtensilsCrossed } from 'lucide-react';
import { RESTAURANT_DETAILS, getTypeLabel, getPriceIndicator } from '@/data/restaurantDetails';
import { MenuLinkChip } from '@/components/map/MenuLinkChip';

interface POI {
  id: string;
  type: 'restaurant' | 'restroom' | 'shop' | 'firstaid' | 'show';
  name: string;
  position: { lat: number; lng: number };
  schedule?: string | null;
  description?: string | null;
  menuUrl?: string | null;
  cuisineType?: string | null;
  requiresReservation?: boolean | null;
  hasWarning?: boolean | null;
  warningText?: string | null;
}

interface RestaurantSidebarCardProps {
  poi: POI;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onOpenMenu?: (url: string, name: string) => void;
}

export function RestaurantSidebarCard({ 
  poi, 
  isSelected, 
  onSelect, 
  onNavigate,
  onOpenMenu 
}: RestaurantSidebarCardProps) {
  const details = RESTAURANT_DETAILS[poi.name];
  const typeInfo = details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
  const reservation = details?.reservation || poi.requiresReservation;

  return (
    <Card 
      variant="glass"
      className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 ${
        isSelected 
          ? 'border-l-orange-500 bg-orange-500/10 shadow-md' 
          : 'border-l-transparent hover:border-l-orange-500/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header: Name & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{poi.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge className={`${typeInfo.color} text-white text-[10px] px-1.5 h-5`}>
                {typeInfo.label}
              </Badge>
              {details && (
                <span className="text-xs text-green-500 font-bold">
                  {getPriceIndicator(details.priceLevel)}
                </span>
              )}
              {reservation && (
                <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-amber-500/50 text-amber-500 gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  Reserva
                </Badge>
              )}
              {poi.cuisineType && (
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                  {poi.cuisineType}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              title="Navegar até o restaurante"
            >
              <Navigation className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Tip Section */}
        {details?.tip && (
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Star className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
            <span className="line-clamp-2">{details.tip}</span>
          </p>
        )}

        {/* Must Try Section */}
        {details?.mustTry && (
          <p className="text-[11px] font-medium text-primary flex items-start gap-1.5">
            <UtensilsCrossed className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Experimente: {details.mustTry}</span>
          </p>
        )}

        {/* Description fallback if no details */}
        {!details && poi.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {poi.description}
          </p>
        )}

        {/* Menu button as styled tag */}
        {poi.menuUrl && (
          <MenuLinkChip
            href={poi.menuUrl}
            onOpenInApp={
              onOpenMenu
                ? () => {
                    onOpenMenu(poi.menuUrl!, poi.name);
                  }
                : undefined
            }
          />
        )}

        {/* Warning */}
        {poi.hasWarning && poi.warningText && (
          <Badge variant="destructive" className="text-[10px] w-full justify-start">
            ⚠️ {poi.warningText}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

