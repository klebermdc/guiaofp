import { CreditCard, Calendar, CheckCircle2, Crown, Map, Sparkles, Route, Play, BookOpen, MessageCircle, Clock, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useGuideContact } from '@/hooks/useGuideContact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Plan = () => {
  const { travelProfile } = useAuth();
  const { hasGuide, guideName, whatsappUrl } = useGuideContact();

  // Features do Planejador Inteligente (Sem Guia)
  const basicFeatures = [
    { icon: Users, text: 'Perfil de viagem completo' },
    { icon: Sparkles, text: 'Seleção de atrações desejadas' },
    { icon: Map, text: 'Mapa do parque' },
    { icon: CheckCircle2, text: 'Guia de viagem (checklist)' },
    { icon: Play, text: 'Conteúdos por parque' },
    { icon: Route, text: 'Roteiro genérico (dicas gerais)' },
  ];

  // Features do Roteiro Inteligente (Com Guia) - inclui tudo do básico + exclusivos
  const premiumExclusiveFeatures = [
    { icon: Route, text: 'Roteiro otimizado com sequência exata' },
    { icon: Clock, text: 'Horários estratégicos de chegada' },
    { icon: Sparkles, text: 'Ajustes em tempo real durante o dia' },
    { icon: MessageCircle, text: 'Suporte via WhatsApp com o guia' },
    { icon: Crown, text: 'Decisão estratégica pelo guia' },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className={`relative overflow-hidden rounded-2xl p-8 text-primary-foreground ${hasGuide ? 'gradient-primary' : 'bg-muted'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-3xl ${hasGuide ? 'gradient-gold' : 'bg-muted-foreground'}`} />
          <div className="relative">
            {hasGuide ? (
              <Crown className="w-12 h-12 text-secondary mb-4" />
            ) : (
              <Map className="w-12 h-12 text-muted-foreground mb-4" />
            )}
            <h1 className={`font-display text-3xl font-bold mb-2 ${!hasGuide && 'text-foreground'}`}>
              Meu Plano
            </h1>
            <p className={hasGuide ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
              {hasGuide ? 'Roteiro Inteligente com Guia' : 'Planejador Inteligente'}
            </p>
          </div>
        </div>

        {/* Plan Type Card */}
        <Card variant={hasGuide ? 'premium' : 'default'}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasGuide ? 'gradient-gold' : 'bg-muted'}`}>
                {hasGuide ? (
                  <Crown className="w-6 h-6 text-secondary-foreground" />
                ) : (
                  <Map className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {hasGuide ? 'Roteiro Inteligente com Guia' : 'Planejador Inteligente'}
                  {hasGuide && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {hasGuide 
                    ? `Guia: ${guideName}` 
                    : 'Você planeja. O sistema organiza.'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${hasGuide ? 'bg-success/10' : 'bg-muted'}`}>
              <CheckCircle2 className={`w-5 h-5 ${hasGuide ? 'text-success' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${hasGuide ? 'text-success' : 'text-muted-foreground'}`}>
                {hasGuide ? 'Serviço Ativo' : 'Plano Ativo'}
              </span>
            </div>

            {/* Dates - only for Premium */}
            {hasGuide && travelProfile.arrivalDate && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Período do guiamento</p>
                    <p className="font-medium">
                      {new Date(travelProfile.arrivalDate).toLocaleDateString('pt-BR')} 
                      {travelProfile.departureDate && ` a ${new Date(travelProfile.departureDate).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Features */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Incluído no seu plano:</h3>
              <ul className="space-y-3">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Exclusive Features */}
            {hasGuide && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Exclusivo do Guiamento Premium:
                </h3>
                <ul className="space-y-3">
                  {premiumExclusiveFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <feature.icon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA for non-premium users */}
        {!hasGuide && (
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Quer um roteiro completo e otimizado?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Com o <strong>Roteiro Inteligente com Guia</strong>, você aproveita. O guia decide. O sistema executa.
                  </p>
                  <Button 
                    onClick={() => window.open('https://wa.me/5511966144493', '_blank')}
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar com um Guia
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Guide Button - for Premium */}
        {hasGuide && whatsappUrl && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Contato com o Guia</h3>
              </div>
              <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar com {guideName}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Plan;