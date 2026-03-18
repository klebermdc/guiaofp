import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hotel, ExternalLink, Loader2, MapPin, Star, DollarSign, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ItineraryData {
  budget: string;
  accommodationType: string;
  selectedParks: string[];
  duration: number;
  stayingRegion?: string;
  adultsCount?: number;
  childrenCount?: number;
  travelStyle?: string;
}

interface HotelRecommendation {
  name: string;
  category: string;
  pricePerNight: number;
  totalEstimate: number;
  distance: string;
  amenities: string[];
  pros: string[];
  cons: string[];
  bookingLink: string;
  imageEmoji: string;
}

interface HotelSuggestionsProps {
  itineraryData: ItineraryData;
}

export const HotelSuggestions = ({ itineraryData }: HotelSuggestionsProps) => {
  const [hotels, setHotels] = useState<HotelRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('suggest-hotels', {
          body: { itineraryData }
        });

        if (fnError) throw fnError;
        setHotels(data.hotels || []);
      } catch (err) {
        console.error('Error fetching hotel suggestions:', err);
        setError('Não foi possível carregar as sugestões de hotéis.');
      } finally {
        setIsLoading(false);
      }
    };

    if (itineraryData.duration > 0) {
      fetchSuggestions();
    } else {
      setIsLoading(false);
    }
  }, [itineraryData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value * 5.5); // Conversão aproximada USD → BRL
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Buscando hotéis para seu perfil...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/30">
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <p className="text-muted-foreground text-center">
          Não encontramos sugestões de hotéis para seu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 p-5 rounded-xl border border-border space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Hotel className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            Sugestões de Hotéis
          </h3>
          <p className="text-sm text-muted-foreground">
            Baseado no seu orçamento e preferências
          </p>
        </div>
      </div>

      {/* Hotel Cards */}
      <div className="space-y-3">
        {hotels.map((hotel, idx) => (
          <div 
            key={idx} 
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            {/* Hotel Header */}
            <button
              type="button"
              onClick={() => setExpandedHotel(expandedHotel === idx ? null : idx)}
              className="w-full p-4 text-left flex items-start gap-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-3xl">{hotel.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{hotel.name}</h4>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {hotel.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{hotel.distance}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">
                    <span className="text-muted-foreground">Por noite:</span>
                    <span className="ml-1 font-semibold text-foreground">{formatCurrency(hotel.pricePerNight)}</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-1 font-semibold text-primary">{formatCurrency(hotel.totalEstimate)}</span>
                  </span>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedHotel === idx && (
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                {/* Amenities */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Comodidades
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hotel.amenities.map((amenity, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-muted text-xs rounded-md text-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pros */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vantagens
                  </span>
                  <ul className="mt-2 space-y-1">
                    {hotel.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Considerações
                  </span>
                  <ul className="mt-2 space-y-1">
                    {hotel.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book Button */}
                <Button 
                  asChild 
                  className="w-full"
                  variant="outline"
                >
                  <a 
                    href={hotel.bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver no Site
                  </a>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
