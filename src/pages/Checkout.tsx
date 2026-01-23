import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle2, 
  Map,
  Crown,
  Lock,
  QrCode,
  Barcode,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceCents: number;
  features: string[];
  icon: typeof Map | typeof Crown;
  gradient?: boolean;
}

const plans: Record<string, Plan> = {
  basic: {
    id: 'basic',
    name: 'Planejador',
    subtitle: 'Autonomia total',
    price: 49,
    priceCents: 90,
    features: [
      'Perfil de viagem completo',
      'Seleção de atrações',
      'Mapa dos parques',
      'Checklist de viagem',
      'Roteiro com dicas gerais',
    ],
    icon: Map,
  },
  premium: {
    id: 'premium',
    name: 'Com Guia',
    subtitle: 'Experiência premium',
    price: 149,
    priceCents: 90,
    features: [
      'Tudo do Planejador +',
      'Roteiro otimizado por horário',
      'Ajustes em tempo real',
      'Suporte via WhatsApp',
      'Guia humano dedicado',
    ],
    icon: Crown,
    gradient: true,
  },
};

type PaymentMethod = 'pix' | 'boleto' | 'credit_card';

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const plan = plans[planId || 'basic'];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    // Credit card fields
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || '',
        }));
      }
    });
  }, []);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Plano não encontrado</p>
            <Link to="/">
              <Button>Voltar para início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.cpf) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (paymentMethod === 'credit_card') {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // TODO: Integrate with payment gateway
      // This would call an edge function that processes the payment
      // using the configured gateway (Stripe, Asaas, MercadoPago, etc.)
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      
      toast.success('Pagamento processado com sucesso!');
      navigate('/login?payment=success');
    } catch (error) {
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Orlando Fast Pass" className="h-10" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            Compra segura
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Finalizar compra
              </h1>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para completar sua compra
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forma de pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <QrCode className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'pix' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        PIX
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'boleto'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Barcode className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'boleto' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'boleto' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Boleto
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'credit_card' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'credit_card' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Cartão
                      </span>
                    </button>
                  </div>

                  {/* PIX Info */}
                  {paymentMethod === 'pix' && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex items-start gap-3">
                        <QrCode className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Pagamento instantâneo</p>
                          <p className="text-sm text-muted-foreground">
                            Após confirmar, você receberá o QR Code para pagamento. 
                            A liberação é automática.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boleto Info */}
                  {paymentMethod === 'boleto' && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <Barcode className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Boleto bancário</p>
                          <p className="text-sm text-muted-foreground">
                            Prazo de compensação de até 3 dias úteis. 
                            Vencimento em 3 dias.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credit Card Form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nome no cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="Como está no cartão"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', formatExpiry(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            placeholder="000"
                            maxLength={4}
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg gradient-primary text-primary-foreground rounded-xl"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Pagar R${plan.price},{plan.priceCents.toString().padStart(2, '0')}
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Seus dados estão protegidos com criptografia SSL
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className={`sticky top-24 ${plan.gradient ? 'border-secondary/50' : ''}`}>
              {plan.gradient && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent rounded-t-lg" />
              )}
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.gradient ? 'gradient-gold' : 'bg-muted'
                  }`}>
                    <PlanIcon className={`w-6 h-6 ${plan.gradient ? 'text-secondary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.gradient ? 'text-secondary' : 'text-success'}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano {plan.name}</span>
                    <span className="text-foreground">R${plan.price},{plan.priceCents.toString().padStart(2, '0')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">R${plan.price}</span>
                      <span className="text-muted-foreground">,{plan.priceCents.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                {plan.gradient && (
                  <Badge className="w-full justify-center py-2 bg-secondary/10 text-secondary border-secondary/20">
                    Mais vendido
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
