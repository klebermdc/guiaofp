import { CreditCard, Calendar, CheckCircle2, Crown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Plan = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-gold opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <Crown className="w-12 h-12 text-secondary mb-4" />
            <h1 className="font-display text-3xl font-bold mb-2">
              Meu Plano
            </h1>
            <p className="text-primary-foreground/80">
              Detalhes do seu guiamento remoto
            </p>
          </div>
        </div>

        {/* Plan Details */}
        <Card variant="premium">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>Guiamento Remoto Premium</CardTitle>
                <p className="text-sm text-muted-foreground">Experiência completa</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Serviço Ativo</span>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Período do guiamento</p>
                  <p className="font-medium">15 a 20 de Janeiro, 2025</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Incluído no seu plano:</h3>
              <ul className="space-y-3">
                {[
                  'Roteiro personalizado dia a dia',
                  'Suporte via WhatsApp em tempo real',
                  'Reservas de restaurantes assistidas',
                  'Configuração do My Disney Experience',
                  'Dicas exclusivas de filas e Lightning Lane',
                  'Acompanhamento durante todos os dias de parque',
                  'Material de preparação exclusivo',
                  'Atendimento prioritário',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Pagamento</h3>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirmado
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Plan;
