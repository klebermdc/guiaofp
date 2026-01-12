import { Calendar, MapPin, Clock, Info, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Agenda = () => {
  const { travelProfile, isLoading } = useAuth();

  // Usar parkDates do perfil de viagem
  const agendaItems = travelProfile.parkDates || [];

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
                As informações abaixo são baseadas no seu perfil de viagem. Para adicionar ou editar parques e datas, acesse seu perfil.
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
                          <span className="font-medium text-foreground">Observações:</span>
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
            <p className="text-muted-foreground mb-6">
              Adicione os parques e datas no seu perfil de viagem para ver sua agenda aqui.
            </p>
            <Link to="/perfil">
              <Button variant="gold">
                Preencher Perfil de Viagem
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Agenda;
