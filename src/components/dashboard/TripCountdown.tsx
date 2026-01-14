import { differenceInDays, differenceInHours, differenceInMinutes, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Calendar, Users, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface TripCountdownProps {
  arrivalDate: string;
  departureDate?: string;
  groupSize?: number;
  parks?: string[];
}

export const TripCountdown = ({ arrivalDate, departureDate, groupSize, parks }: TripCountdownProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const arrival = parseISO(arrivalDate);
  const daysUntilTrip = differenceInDays(arrival, now);
  const hoursUntilTrip = differenceInHours(arrival, now) % 24;
  const minutesUntilTrip = differenceInMinutes(arrival, now) % 60;

  const tripDuration = departureDate 
    ? differenceInDays(parseISO(departureDate), arrival) + 1
    : null;

  const isTripStarted = daysUntilTrip < 0;
  const isTripToday = daysUntilTrip === 0;

  const getCountdownMessage = () => {
    if (isTripStarted) {
      return "Sua viagem já começou! 🎉";
    }
    if (isTripToday) {
      return "É HOJE! Boa viagem! ✈️";
    }
    if (daysUntilTrip <= 7) {
      return "Falta pouco! 🎢";
    }
    if (daysUntilTrip <= 30) {
      return "Contagem regressiva! ⏰";
    }
    return "Sua aventura está chegando! 🌟";
  };

  const formattedArrival = format(arrival, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card className="relative overflow-hidden border-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-secondary/30 rounded-full blur-xl" />
      
      <CardContent className="relative p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-white/80">{getCountdownMessage()}</span>
        </div>

        {/* Main countdown */}
        {!isTripStarted && (
          <div className="mb-6">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl md:text-7xl font-display font-bold tracking-tight">
                {daysUntilTrip}
              </span>
              <span className="text-2xl md:text-3xl font-medium pb-2 text-white/80">
                {daysUntilTrip === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            
            {daysUntilTrip <= 7 && daysUntilTrip > 0 && (
              <div className="flex gap-4 text-sm text-white/70">
                <span>{hoursUntilTrip}h {minutesUntilTrip}min restantes</span>
              </div>
            )}
          </div>
        )}

        {/* Trip info pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Plane className="w-4 h-4" />
            <span className="text-sm font-medium">{formattedArrival}</span>
          </div>
          
          {tripDuration && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{tripDuration} dias de viagem</span>
            </div>
          )}
          
          {groupSize && groupSize > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{groupSize} {groupSize === 1 ? 'viajante' : 'viajantes'}</span>
            </div>
          )}
        </div>

        {/* Parks */}
        {parks && parks.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-white/70" />
            <div className="flex flex-wrap gap-2">
              {parks.slice(0, 4).map((park, index) => (
                <span 
                  key={index}
                  className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1"
                >
                  {park}
                </span>
              ))}
              {parks.length > 4 && (
                <span className="text-xs text-white/60">+{parks.length - 4} mais</span>
              )}
            </div>
          </div>
        )}

        {/* Decorative plane icon */}
        <div className="absolute top-6 right-6 opacity-20">
          <Plane className="w-16 h-16 md:w-20 md:h-20 transform rotate-45" />
        </div>
      </CardContent>
    </Card>
  );
};
