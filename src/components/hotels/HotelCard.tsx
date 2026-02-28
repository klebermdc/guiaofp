import { useState } from 'react';
import { Hotel, categoryLabels, categoryColors } from '@/data/hotelsData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Bus, Car, Waves, UtensilsCrossed, PawPrint, Plus, Check, ExternalLink, AlertTriangle } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  isSelected: boolean;
  canSelect: boolean;
  onToggleCompare: (hotel: Hotel) => void;
  imageOverride?: string;
}

const StarRating = ({ stars }: { stars: number }) => {
  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      ))}
      {half && <Star className="w-3.5 h-3.5 fill-yellow-400/50 text-yellow-400" />}
    </div>
  );
};

const AmenityIcon = ({ show, icon: Icon, label }: { show: boolean; icon: any; label: string }) => {
  if (!show) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top"><p className="text-xs">{label}</p></TooltipContent>
    </Tooltip>
  );
};

export function HotelCard({ hotel, isSelected, canSelect, onToggleCompare, imageOverride }: HotelCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80`;
  
  return (
    <Card variant="interactive" className="overflow-hidden group">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={imgError ? fallbackImg : (imageOverride || hotel.imageUrl)}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge className={`text-[10px] font-semibold ${categoryColors[hotel.category]}`}>
            {categoryLabels[hotel.category]}
          </Badge>
          {hotel.isOnSite && (
            <Badge className="text-[10px] bg-primary text-primary-foreground">On-Site</Badge>
          )}
        </div>
        <Button
          size="icon-sm"
          variant={isSelected ? 'default' : 'outline'}
          className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm border-border/50"
          onClick={(e) => { e.stopPropagation(); onToggleCompare(hotel); }}
          disabled={!isSelected && !canSelect}
        >
          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">{hotel.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating stars={hotel.stars} />
            <span className="text-[11px] text-muted-foreground">• {hotel.chain}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>🏰 Disney: {hotel.distanceToDisney}</span>
          <span>🎢 Universal: {hotel.distanceToUniversal}</span>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1">
          {hotel.highlights.slice(0, 3).map((h) => (
            <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{h}</span>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex gap-1">
          <AmenityIcon show={hotel.amenities.shuttle} icon={Bus} label="Shuttle para parques" />
          <AmenityIcon show={hotel.amenities.freeParking} icon={Car} label="Estacionamento gratuito" />
          <AmenityIcon show={hotel.amenities.pool} icon={Waves} label="Piscina" />
          <AmenityIcon show={hotel.amenities.restaurant} icon={UtensilsCrossed} label="Restaurante" />
          <AmenityIcon show={hotel.amenities.petFriendly} icon={PawPrint} label="Pet Friendly" />
        </div>

        {/* Price */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Estimativa por noite
              </p>
              <p className="text-lg font-bold text-foreground">US$ {hotel.priceEstimate.avg}</p>
              <p className="text-[10px] text-muted-foreground">
                US$ {hotel.priceEstimate.min} – US$ {hotel.priceEstimate.max}
              </p>
            </div>
            <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                Ver <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
