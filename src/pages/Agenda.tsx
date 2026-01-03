import { Calendar, MapPin, Clock, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const agendaItems = [
  {
    date: '15 de Janeiro, 2025',
    park: 'Magic Kingdom',
    time: '08:00 - 22:00',
    notes: 'Dia de abertura antecipada para hóspedes Disney. Focar em atrações do Fantasyland pela manhã.',
    status: 'upcoming',
  },
  {
    date: '16 de Janeiro, 2025',
    park: 'EPCOT',
    time: '09:00 - 21:00',
    notes: 'Aproveitar as novas atrações do World Showcase. Reserva para jantar confirmada.',
    status: 'upcoming',
  },
  {
    date: '17 de Janeiro, 2025',
    park: 'Hollywood Studios',
    time: '08:30 - 20:00',
    notes: 'Prioridade para Galaxy\'s Edge e Toy Story Land. Lightning Lane já reservado para Rise of the Resistance.',
    status: 'upcoming',
  },
  {
    date: '18 de Janeiro, 2025',
    park: 'Animal Kingdom',
    time: '07:30 - 19:00',
    notes: 'Abertura antecipada para Avatar Flight of Passage. Safari pela manhã para melhor visualização dos animais.',
    status: 'upcoming',
  },
];

const Agenda = () => {
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

        {/* Agenda Items */}
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
                  <p className="font-display font-bold text-lg">{item.date.split(',')[0]}</p>
                  <p className="text-sm text-primary-foreground/80">{item.date.split(',')[1]}</p>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      {item.park}
                    </h3>
                    <span className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm w-fit">
                      <Clock className="w-4 h-4" />
                      {item.time}
                    </span>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Observações do guia:</span>
                      <br />
                      {item.notes}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State (when no agenda) */}
        {agendaItems.length === 0 && (
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
