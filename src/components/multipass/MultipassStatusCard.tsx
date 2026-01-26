import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Ticket, Loader2, Undo2 } from 'lucide-react';
import { useMultipassStatus } from '@/hooks/useMultipassStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DISNEY_PARKS = [
  "Magic Kingdom",
  "EPCOT", 
  "Animal Kingdom",
  "Hollywood Studios"
];

const DISNEY_HOTELS = [
  "disney", "grand floridian", "contemporary", "polynesian", "wilderness lodge",
  "boardwalk", "yacht club", "beach club", "swan", "dolphin", "port orleans",
  "coronado springs", "caribbean beach", "riviera", "art of animation",
  "pop century", "all-star", "fort wilderness", "animal kingdom lodge"
];

export const MultipassStatusCard = forwardRef<HTMLDivElement>((_, ref) => {
  const { travelProfile, planTier } = useAuth();
  const { status, isLoading, confirmPurchase, undoPurchase } = useMultipassStatus();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  // Only show for premium clients
  if (planTier !== 'premium') return null;

  // Get first Disney park date
  const parkDates = travelProfile.parkDates || [];
  const disneyDates = parkDates
    .filter(pd => DISNEY_PARKS.some(dp => pd.park?.toLowerCase().includes(dp.toLowerCase())))
    .map(pd => pd.date)
    .filter(Boolean)
    .sort();
  
  const firstDisneyDate = disneyDates.length > 0 ? disneyDates[0] : null;

  // Check if Disney hotel
  const hotelInfo = `${travelProfile.hotel || ''} ${travelProfile.hotelType || ''}`.toLowerCase();
  const isDisneyHotel = DISNEY_HOTELS.some(dh => hotelInfo.includes(dh));
  const daysBeforeNotification = isDisneyHotel ? 7 : 3;

  if (!firstDisneyDate) return null;

  const firstParkDate = parseISO(firstDisneyDate);
  const today = new Date();
  const daysUntilPark = differenceInDays(firstParkDate, today);

  // Only show if within notification window
  if (daysUntilPark > daysBeforeNotification + 2) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    const result = await confirmPurchase('client');
    
    if (result.success) {
      toast({
        title: "✅ MultiPass confirmado!",
        description: "Obrigado por confirmar. Seu guia será notificado.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar. Tente novamente.",
        variant: "destructive",
      });
    }
    setIsConfirming(false);
  };

  const handleUndo = async () => {
    setIsConfirming(true);
    const result = await undoPurchase();
    
    if (result.success) {
      toast({
        title: "Confirmação removida",
        description: "Você pode confirmar novamente quando comprar.",
      });
    }
    setIsConfirming(false);
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isPurchased = status?.is_purchased;
  const isUrgent = daysUntilPark <= 1 && !isPurchased;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${
        isPurchased ? 'border-green-500/50 bg-green-50/50' :
        isUrgent ? 'border-destructive/50 bg-destructive/5' :
        'border-amber-500/50 bg-amber-50/50'
      }`}>
        {/* Decorative gradient */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isPurchased ? 'bg-gradient-to-r from-green-400 to-green-600' :
          isUrgent ? 'bg-gradient-to-r from-red-400 to-red-600' :
          'bg-gradient-to-r from-amber-400 to-amber-600'
        }`} />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5" />
              MultiPass Disney
            </CardTitle>
            <Badge variant={isPurchased ? "default" : isUrgent ? "destructive" : "secondary"}>
              {isPurchased ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Comprado</>
              ) : isUrgent ? (
                <><AlertTriangle className="h-3 w-3 mr-1" /> Urgente</>
              ) : (
                <><Clock className="h-3 w-3 mr-1" /> Pendente</>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Primeiro parque Disney:</strong>{' '}
              {format(firstParkDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="mt-1">
              {isDisneyHotel ? (
                <span className="text-green-600">🏨 Hóspede Disney - compra liberada 7 dias antes</span>
              ) : (
                <span className="text-blue-600">🏨 Hotel externo - compra liberada 3 dias antes</span>
              )}
            </p>
          </div>

          {isPurchased ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Confirmado em {status?.purchased_at && format(parseISO(status.purchased_at), "dd/MM 'às' HH:mm")}
                {status?.confirmed_by && (
                  <span className="text-muted-foreground">
                    ({status.confirmed_by === 'guide' ? 'pelo guia' : 'por você'})
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={isConfirming}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Desfazer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {isUrgent && (
                <p className="text-sm text-destructive font-medium">
                  ⚠️ {daysUntilPark === 0 ? 'Hoje é seu parque!' : 'Amanhã é seu parque!'} Confirme a compra urgentemente.
                </p>
              )}
              
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className={`w-full ${isUrgent ? 'bg-destructive hover:bg-destructive/90' : ''}`}
              >
                {isConfirming ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirmar que comprei o MultiPass
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Clique após finalizar a compra no app My Disney Experience
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

MultipassStatusCard.displayName = 'MultipassStatusCard';
