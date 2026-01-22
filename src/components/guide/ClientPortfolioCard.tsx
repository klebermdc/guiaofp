import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight,
  Clock,
  Star,
  MessageCircle,
  Headphones,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MultipassBadge, isDisneyHotel } from '@/components/multipass/MultipassBadge';

interface MultipassStatus {
  id: string;
  user_id: string;
  is_purchased: boolean;
  purchased_at: string | null;
  confirmed_by: string | null;
  first_disney_park_date: string | null;
}

interface ClientProfile {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  group_size: number | null;
  travelers: any[];
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  hotel: string | null;
  hotel_type?: string | null;
  completion_percentage: number | null;
  is_access_enabled: boolean | null;
  guide_name: string | null;
  park_dates?: any;
}

interface ClientPortfolioCardProps {
  client: ClientProfile;
  attractionCount?: number;
  onDeleted?: () => void;
  multipassStatus?: MultipassStatus | null;
}

export function ClientPortfolioCard({ client, attractionCount = 0, onDeleted, multipassStatus }: ClientPortfolioCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate first Disney park date from park_dates
  const getFirstDisneyDate = (): string | null => {
    if (!client.park_dates) return null;
    
    const DISNEY_PARKS = ['Magic Kingdom', 'Epcot', 'Animal Kingdom', 'Hollywood Studios'];
    const parkDates = client.park_dates;
    
    let firstDate: string | null = null;
    
    Object.entries(parkDates).forEach(([date, parks]) => {
      if (Array.isArray(parks)) {
        const hasDisney = parks.some((park: string) => 
          DISNEY_PARKS.some(dp => park.includes(dp))
        );
        if (hasDisney) {
          if (!firstDate || date < firstDate) {
            firstDate = date;
          }
        }
      }
    });
    
    return firstDate;
  };

  const firstDisneyDate = multipassStatus?.first_disney_park_date || getFirstDisneyDate();
  const clientIsDisneyHotel = isDisneyHotel(client.hotel || '', client.hotel_type || '');

  const handleDeleteContract = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('user_id', client.user_id);
      
      if (error) throw error;
      
      toast.success(`Contrato de ${client.responsible_name || 'cliente'} excluído com sucesso`);
      onDeleted?.();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Erro ao excluir contrato');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const getDaysUntilTrip = () => {
    if (!client.arrival_date) return null;
    const arrival = new Date(client.arrival_date);
    const today = new Date();
    const diffTime = arrival.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatWhatsAppNumber = (phone: string | null) => {
    if (!phone) return null;
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Add country code if not present (assuming Brazil)
    if (cleaned.length === 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  };

  const getWhatsAppUrl = () => {
    const formattedNumber = formatWhatsAppNumber(client.whatsapp);
    if (!formattedNumber) return null;
    
    const firstName = client.responsible_name?.split(' ')[0] || 'Cliente';
    const daysUntil = getDaysUntilTrip();
    
    let message = `Olá ${firstName}! 👋\n\n`;
    
    if (daysUntil !== null && daysUntil > 0 && daysUntil <= 30) {
      message += `Faltam apenas *${daysUntil} dias* para sua viagem! 🎢✨\n\n`;
    }
    
    message += `Estou entrando em contato para acompanhar os preparativos da sua viagem a Orlando.\n\nComo posso ajudar?`;
    
    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getWhatsAppUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const daysUntilTrip = getDaysUntilTrip();
  const completionPct = client.completion_percentage || 0;
  const hasWhatsApp = !!client.whatsapp;
  
  const getStatusBadge = () => {
    if (!client.is_access_enabled) {
      return <Badge variant="outline" className="text-muted-foreground">Acesso bloqueado</Badge>;
    }
    if (daysUntilTrip !== null && daysUntilTrip <= 7 && daysUntilTrip > 0) {
      return <Badge className="bg-warning text-warning-foreground">Viagem próxima</Badge>;
    }
    if (daysUntilTrip !== null && daysUntilTrip <= 0) {
      return <Badge className="bg-success text-success-foreground">Em viagem</Badge>;
    }
    if (completionPct >= 80) {
      return <Badge variant="secondary">Perfil completo</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning">Perfil incompleto</Badge>;
  };

  return (
    <Card 
      variant="interactive" 
      className="overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/admin/cliente/${client.user_id}`)}
    >
      <CardContent className="p-0">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                {client.responsible_name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {client.responsible_name || 'Cliente'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {client.email}
                </p>
                {client.guide_name && (
                  <div className="flex items-center gap-1 mt-1">
                    <Headphones className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      {client.guide_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {client.arrival_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {formatDate(client.arrival_date)} - {formatDate(client.departure_date)}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <span>{client.group_size || 1} viajante{(client.group_size || 1) > 1 ? 's' : ''}</span>
            </div>

            {client.parks && client.parks.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{client.parks.slice(0, 3).join(', ')}{client.parks.length > 3 ? '...' : ''}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Perfil</span>
              <span className={cn(
                "font-medium",
                completionPct >= 80 ? "text-success" : completionPct >= 50 ? "text-warning" : "text-muted-foreground"
              )}>
                {completionPct}%
              </span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <MultipassBadge
                isPurchased={multipassStatus?.is_purchased || false}
                firstDisneyDate={firstDisneyDate}
                isDisneyHotel={clientIsDisneyHotel}
                purchasedAt={multipassStatus?.purchased_at}
                confirmedBy={multipassStatus?.confirmed_by}
              />
              {attractionCount > 0 && (
                <Badge variant="outline" className="text-accent border-accent">
                  <Star className="w-3 h-3 mr-1" />
                  {attractionCount} atrações
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {daysUntilTrip !== null && daysUntilTrip > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysUntilTrip}d
                </span>
              )}
              
              {hasWhatsApp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)] text-white"
                  onClick={handleWhatsAppClick}
                  title={`Enviar mensagem para ${client.responsible_name || 'cliente'}`}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    onClick={(e) => e.stopPropagation()}
                    title={`Excluir contrato de ${client.responsible_name || 'cliente'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o contrato de <strong>{client.responsible_name || 'cliente'}</strong>?
                      <br /><br />
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteContract}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
