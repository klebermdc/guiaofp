import { Ticket, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parseISO, differenceInDays } from 'date-fns';

interface MultipassBadgeProps {
  isPurchased: boolean;
  firstDisneyDate: string | null;
  isDisneyHotel?: boolean;
  purchasedAt?: string | null;
  confirmedBy?: string | null;
}

const DISNEY_HOTELS = [
  "disney", "grand floridian", "contemporary", "polynesian", "wilderness lodge",
  "boardwalk", "yacht club", "beach club", "swan", "dolphin", "port orleans",
  "coronado springs", "caribbean beach", "riviera", "art of animation",
  "pop century", "all-star", "fort wilderness", "animal kingdom lodge"
];

export function isDisneyHotel(hotel: string, hotelType: string = ''): boolean {
  const combined = `${hotel} ${hotelType}`.toLowerCase();
  return DISNEY_HOTELS.some(dh => combined.includes(dh));
}

export function MultipassBadge({ 
  isPurchased, 
  firstDisneyDate, 
  isDisneyHotel = false,
  purchasedAt,
  confirmedBy
}: MultipassBadgeProps) {
  if (!firstDisneyDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parkDate = parseISO(firstDisneyDate);
  const daysUntilPark = differenceInDays(parkDate, today);
  const notificationWindow = isDisneyHotel ? 7 : 3;

  // Only show if within notification window
  if (daysUntilPark > notificationWindow + 2) return null;

  if (isPurchased) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700 gap-1">
              <Ticket className="h-3 w-3" />
              MultiPass ✓
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Confirmado {purchasedAt && format(parseISO(purchasedAt), "dd/MM 'às' HH:mm")}
              {confirmedBy && ` (${confirmedBy === 'guide' ? 'pelo guia' : 'pelo cliente'})`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const isUrgent = daysUntilPark <= 1;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 ${
              isUrgent 
                ? 'bg-red-50 border-red-500 text-red-700 animate-pulse' 
                : 'bg-amber-50 border-amber-500 text-amber-700'
            }`}
          >
            <Ticket className="h-3 w-3" />
            {isUrgent ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                MultiPass!
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                MultiPass
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isUrgent 
              ? 'URGENTE: Cliente não confirmou compra do MultiPass!'
              : `MultiPass pendente - Parque em ${daysUntilPark} dias`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
