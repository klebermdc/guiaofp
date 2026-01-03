import { Star, Heart, Gift, MessageSquare, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PostTrip = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-magic p-8 text-accent-foreground text-center">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-gold opacity-20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 gradient-primary opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-secondary" />
            <h1 className="font-display text-3xl font-bold mb-2">
              Obrigado pela viagem mágica! ✨
            </h1>
            <p className="text-accent-foreground/80 max-w-md mx-auto">
              Foi um prazer acompanhar você e sua família nessa experiência inesquecível.
            </p>
          </div>
        </div>

        {/* Thank You Message */}
        <Card variant="premium">
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 mx-auto text-accent mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Sua jornada foi especial para nós
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cada momento de magia que vocês viveram nos enche de alegria. 
              Esperamos ter contribuído para tornar essa viagem inesquecível!
            </p>
          </CardContent>
        </Card>

        {/* Review CTA */}
        <Card className="overflow-hidden">
          <div className="gradient-gold p-6">
            <div className="flex items-center gap-4 text-secondary-foreground">
              <Star className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold">
                  Conta pra gente como foi!
                </h3>
                <p className="text-secondary-foreground/80 text-sm">
                  Sua avaliação nos ajuda a melhorar cada vez mais
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <Button variant="gold" size="lg" className="w-full">
              <MessageSquare className="mr-2" />
              Deixar minha avaliação
            </Button>
          </CardContent>
        </Card>

        {/* Other Services */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-6 h-6 text-accent" />
              <h3 className="font-semibold text-foreground">Outros serviços Orlando Fast Pass</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Já está pensando na próxima aventura? Confira nossos outros serviços:
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Guiamento Presencial',
                  description: 'Acompanhamento físico dentro dos parques',
                },
                {
                  title: 'Consultoria de Viagem',
                  description: 'Planejamento completo da sua próxima trip',
                },
                {
                  title: 'Pacotes Especiais',
                  description: 'Experiências exclusivas e eventos especiais',
                },
              ].map((service, index) => (
                <div 
                  key={index}
                  className="p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <h4 className="font-medium text-foreground">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              Falar sobre novos serviços
            </Button>
          </CardContent>
        </Card>

        {/* Social */}
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            Siga-nos para mais dicas de Orlando
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              @
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostTrip;
