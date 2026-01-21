import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  completion_percentage: number | null;
  is_access_enabled: boolean | null;
}

interface ClientPortfolioCardProps {
  client: ClientProfile;
  attractionCount?: number;
}

export function ClientPortfolioCard({ client, attractionCount = 0 }: ClientPortfolioCardProps) {
  const navigate = useNavigate();
  
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

  const daysUntilTrip = getDaysUntilTrip();
  const completionPct = client.completion_percentage || 0;
  
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
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {attractionCount > 0 && (
                <Badge variant="outline" className="text-accent border-accent">
                  <Star className="w-3 h-3 mr-1" />
                  {attractionCount} atrações
                </Badge>
              )}
            </div>
            
            {daysUntilTrip !== null && daysUntilTrip > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysUntilTrip}d
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
