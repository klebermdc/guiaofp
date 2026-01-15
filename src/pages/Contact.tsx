import { MessageCircle, Clock, Headphones, Shield } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGuideContact } from '@/hooks/useGuideContact';

const Contact = () => {
  const { whatsappUrl, guideName, hasGuide } = useGuideContact();
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-[hsl(142_70%_45%)] p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold mb-2">
              Fale com seu Guia
            </h1>
            <p className="text-white/80">
              Suporte em tempo real durante toda a sua viagem
            </p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <Card variant="premium">
          <CardContent className="p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Atendimento via WhatsApp
            </h2>
            <p className="text-muted-foreground mb-6">
              Nosso time está pronto para ajudar você em qualquer momento. 
              Dúvidas, ajustes no roteiro, ou qualquer imprevisto - estamos aqui!
            </p>
            {hasGuide ? (
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="xl" className="w-full md:w-auto">
                  <MessageCircle size={24} />
                  Falar com {guideName} no WhatsApp
                </Button>
              </a>
            ) : (
              <p className="text-muted-foreground">
                Selecione seu guia no perfil para ativar o WhatsApp direto.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground mx-auto mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Resposta Rápida</h3>
              <p className="text-sm text-muted-foreground">
                Retorno em até 15 minutos durante horário de atendimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-magic rounded-xl flex items-center justify-center text-accent-foreground mx-auto mb-4">
                <Headphones size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-muted-foreground">
                Guia exclusivo para acompanhar toda sua viagem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center text-secondary-foreground mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Suas informações tratadas com total confidencialidade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hours */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Horários de Atendimento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brasil (Brasília)</span>
                <span className="font-medium">08:00 - 23:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orlando (EST)</span>
                <span className="font-medium">07:00 - 22:00</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Durante os dias de parque, o suporte é estendido conforme horário de funcionamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Contact;
