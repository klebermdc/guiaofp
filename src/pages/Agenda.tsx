import { Calendar, MapPin, Clock, Info, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ParkDate {
  date: string;
  park: string;
  time_start?: string;
  time_end?: string;
  notes?: string;
}

interface Contract {
  id: string;
  user_id: string;
  external_contract_id: string | null;
  parks: ParkDate[];
  start_date: string | null;
  end_date: string | null;
  status: string;
}

const Agenda = () => {
  const { user } = useAuth();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      
      const parks = Array.isArray(data.parks) ? data.parks as unknown as ParkDate[] : [];
      
      return {
        ...data,
        parks
      } as Contract;
    },
    enabled: !!user?.id,
  });

  const agendaItems = contract?.parks || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-gold opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <h1 className="font-display text-3xl font-bold mb-2">
              📅 Agenda do Guiamento
            </h1>
            <p className="text-primary-foreground/80">
              Seu roteiro personalizado dia a dia
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card variant="premium" className="border-l-4 border-l-accent">
          <CardContent className="p-6 flex items-start gap-4">
            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Sua agenda será atualizada conforme o guiamento
              </p>
              <p className="text-sm text-muted-foreground">
                As informações abaixo são uma prévia do seu roteiro. Detalhes específicos de horários e atrações serão compartilhados pelo seu guia via WhatsApp no dia de cada parque.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Agenda Items */}
        {!isLoading && agendaItems.length > 0 && (
          <div className="space-y-4">
            {agendaItems.map((item, index) => (
              <Card 
                key={index} 
                variant="interactive"
                className="overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Badge */}
                  <div className="bg-primary text-primary-foreground p-6 md:w-48 flex flex-col items-center justify-center text-center">
                    <Calendar className="w-8 h-8 mb-2" />
                    <p className="font-display font-bold text-lg">
                      {formatDate(item.date).split(' de ')[0]}
                    </p>
                    <p className="text-sm text-primary-foreground/80">
                      de {formatDate(item.date).split(' de ').slice(1).join(' de ')}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                      <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        {item.park}
                      </h3>
                      {(item.time_start || item.time_end) && (
                        <span className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm w-fit">
                          <Clock className="w-4 h-4" />
                          {item.time_start || '08:00'} - {item.time_end || '22:00'}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Observações do guia:</span>
                          <br />
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && agendaItems.length === 0 && (
          <Card className="text-center p-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Agenda em preparação
            </h3>
            <p className="text-muted-foreground">
              Seu roteiro personalizado será disponibilizado em breve, após a análise do seu perfil de viagem.
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Agenda;
