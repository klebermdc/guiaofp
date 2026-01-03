import { BookOpen, Play, CheckSquare, Smartphone, Wifi, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const contentItems = [
  {
    icon: BookOpen,
    title: 'Guia Rápido dos Parques',
    description: 'Tudo que você precisa saber sobre cada parque em um guia prático e objetivo.',
    type: 'PDF',
    color: 'gradient-primary',
  },
  {
    icon: Play,
    title: 'Vídeos de Preparação',
    description: 'Série de vídeos curtos para você chegar preparado para a magia.',
    type: 'Vídeo',
    color: 'gradient-magic',
  },
  {
    icon: CheckSquare,
    title: 'Checklist Pré-Parque',
    description: 'Lista completa do que fazer antes de cada dia de parque.',
    type: 'Checklist',
    color: 'gradient-gold',
  },
  {
    icon: Smartphone,
    title: 'Tutorial My Disney Experience',
    description: 'Como usar o aplicativo da Disney para aproveitar ao máximo sua viagem.',
    type: 'Tutorial',
    color: 'gradient-primary',
  },
  {
    icon: Wifi,
    title: 'Guia de Internet e Chip',
    description: 'Dicas sobre chip internacional, WiFi nos parques e como manter conexão.',
    type: 'Guia',
    color: 'gradient-magic',
  },
];

const Content = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-gold p-8 text-secondary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Exclusivo para membros</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              📚 Preparação para sua Viagem
            </h1>
            <p className="text-secondary-foreground/80">
              Conteúdos exclusivos para tornar sua experiência ainda mais mágica
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index} 
                variant="interactive"
                className="overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description}
                      </p>
                      <Button variant="outline" size="sm">
                        Acessar conteúdo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon */}
        <Card className="text-center p-8 border-dashed border-2">
          <Sparkles className="w-12 h-12 mx-auto text-accent mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Mais conteúdos em breve!
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Estamos sempre preparando novos materiais exclusivos para tornar sua viagem ainda mais especial.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Content;
