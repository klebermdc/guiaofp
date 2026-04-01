import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle2, 
  Map,
  Crown,
  Lock,
  QrCode,
  Loader2,
  Copy,
  ExternalLink,
  Check,
  Tag,
  X,
  User,
  LogIn
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import asaasLogo from '@/assets/asaas-logo.png';
import { TERMS_VERSION } from './TermsAndPrivacy';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePlanPricing, formatPriceBRL } from '@/hooks/usePlanPricing';
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = '0x4AAAAAACs32oq0qnTFCG1M';

// Plan icons map
const planIcons: Record<string, typeof Map | typeof Crown> = {
  basic: Map,
  premium: Crown,
};

type PaymentMethod = 'pix' | 'credit_card';

interface PaymentResult {
  transactionId: string;
  method: PaymentMethod;
  pixQrCode?: string;
  pixPayload?: string;
  invoiceUrl?: string;
}

interface AppliedCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { trackPurchase, trackBeginCheckout } = useAnalytics();
  const { data: dbPlans, isLoading: isLoadingPlans } = usePlanPricing();

  // Derive plan from DB data
  const planKey = planId || 'basic';
  const dbPlan = dbPlans?.[planKey];
  const plan = dbPlan ? {
    id: dbPlan.plan_key,
    name: dbPlan.plan_name,
    subtitle: dbPlan.subtitle || '',
    features: dbPlan.features,
    icon: planIcons[dbPlan.plan_key] || Map,
    gradient: dbPlan.plan_key === 'premium',
    price_cents: dbPlan.price_cents,
  } : null;

  // User state
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  
  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);
  
  // Form fields - only CPF and payment info needed
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    cardHolderCep: '',
    cardHolderAddressNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  // Calculate amounts from DB price
  const originalAmountCents = plan?.price_cents || 0;
  const discountAmountCents = appliedCoupon?.discountAmount || 0;
  const finalAmountCents = Math.max(0, originalAmountCents - discountAmountCents);
  const finalPrice = Math.floor(finalAmountCents / 100);
  const finalCents = finalAmountCents % 100;

  // Check authentication and load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Not logged in - redirect to register
        toast.error('Você precisa criar uma conta para continuar');
        navigate(`/registro/${planId || 'basic'}`, { replace: true });
        return;
      }

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('responsible_name, whatsapp')
        .eq('user_id', session.user.id)
        .single();

      setUserProfile({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.responsible_name || session.user.user_metadata?.name || '',
        phone: profile?.whatsapp || '',
      });

      // Pre-fill phone if available
      if (profile?.whatsapp) {
        setFormData(prev => ({ ...prev, phone: profile.whatsapp || '' }));
      }

      setIsLoadingUser(false);
    };

    loadUser();
  }, [navigate, planId]);

  // Track abandoned cart on page load (begin_checkout moved to Register page button click)
  const hasTrackedView = useRef(false);
  useEffect(() => {
    if (plan && userProfile && !hasTrackedView.current) {
      hasTrackedView.current = true;
      
      // Update abandoned cart with user's actual info
      supabase.functions.invoke('track-abandoned-cart', {
        body: {
          visitor_id: userProfile.id,
          cart_type: plan.id,
          cart_items: [{
            name: plan.name,
            type: 'plan',
            plan_key: plan.id,
            price_cents: plan.price_cents,
            features: plan.features,
          }],
          total_value_cents: plan.price_cents,
          metadata: {
            contact_name: userProfile.name,
            contact_email: userProfile.email,
            contact_phone: userProfile.phone || null,
            is_anonymous: false,
            checkout_started: new Date().toISOString(),
          },
          action: 'create_or_update',
        },
      }).catch(console.error);
    }
  }, [plan, userProfile, originalAmountCents]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Cupom inválido ou expirado');
        return;
      }

      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast.error('Este cupom expirou');
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('Este cupom atingiu o limite de uso');
        return;
      }

      if (data.min_amount_cents && originalAmountCents < data.min_amount_cents) {
        toast.error(`Valor mínimo para este cupom: R$${(data.min_amount_cents / 100).toFixed(2)}`);
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = Math.floor(originalAmountCents * (data.discount_value / 100));
      } else {
        discountAmount = data.discount_value;
      }

      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type as 'percentage' | 'fixed',
        discount_value: data.discount_value,
        discountAmount,
      });

      toast.success(`Cupom "${data.code}" aplicado!`);
    } catch {
      toast.error('Erro ao validar cupom');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Cupom removido');
  };

  if (isLoadingUser || isLoadingPlans) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <LogIn className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Você precisa estar logado para continuar</p>
            <div className="flex gap-2">
              <Link to={`/registro/${planId || 'basic'}`} className="flex-1">
                <Button className="w-full">Criar conta</Button>
              </Link>
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">Fazer login</Button>
              </Link>
            </div>
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Você precisa aceitar os Termos de Uso e Política de Privacidade');
      return;
    }

    if (!turnstileToken) {
      toast.error('Complete a verificação de segurança');
      return;
    }
    
    if (!formData.cpf) {
      toast.error('Preencha o CPF');
      return;
    }

    if (paymentMethod === 'credit_card') {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
      if (!formData.phone || !formData.cardHolderCep || !formData.cardHolderAddressNumber) {
        toast.error('Preencha telefone, CEP e número do endereço do titular');
        return;
      }
    }

    setIsProcessing(true);

    // Verify Turnstile token server-side
    const { data: turnstileResult } = await supabase.functions.invoke('verify-turnstile', {
      body: { token: turnstileToken },
    });

    if (!turnstileResult?.success) {
      toast.error('Verificação de segurança falhou. Tente novamente.');
      setTurnstileToken(null);
      setIsProcessing(false);
      return;
    }

    const buyer = {
      email: userProfile.email,
      phone: formData.phone || userProfile.phone,
      first_name: userProfile.name?.split(' ')[0],
      last_name: userProfile.name?.split(' ').slice(1).join(' '),
      full_name: userProfile.name,
      postal_code: formData.cardHolderCep?.replace(/\D/g, ''),
      cpf: formData.cpf?.replace(/\D/g, ''),
      country: 'BR',
    };

    // add_payment_info removed to save Stape hits — begin_checkout + purchase is sufficient

    try {
      const billingTypeMap: Record<PaymentMethod, string> = {
        pix: 'PIX',
        credit_card: 'CREDIT_CARD',
      };

      let creditCardData = undefined;
      if (paymentMethod === 'credit_card') {
        const [expiryMonth, expiryYear] = formData.cardExpiry.split('/');
        creditCardData = {
          holderName: formData.cardName,
          number: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear: `20${expiryYear}`,
          ccv: formData.cardCvv,
        };
      }

      // Capture browser context for server-side CAPI deduplication
      const getFbpCookie = () => document.cookie.match(/_fbp=([^;]+)/)?.[1] || null;
      const getFbcCookie = () => {
        const match = document.cookie.match(/_fbc=([^;]+)/);
        if (match) return match[1];
        const fbclid = new URL(window.location.href).searchParams.get('fbclid');
        return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
      };
      const getGaCid = () => document.cookie.match(/_ga=GA\d+\.\d+\.(.+)/)?.[1] || null;

      const response = await supabase.functions.invoke('create-asaas-payment', {
        body: {
          customerName: userProfile.name,
          email: userProfile.email,
          cpfCnpj: formData.cpf.replace(/\D/g, ''),
          phone: (formData.phone || userProfile.phone || '').replace(/\D/g, ''),
          planKey: plan.id,
          amountCents: finalAmountCents,
          originalAmountCents,
          discountAmountCents,
          couponCode: appliedCoupon?.code || null,
          billingType: billingTypeMap[paymentMethod],
          creditCard: creditCardData,
          creditCardHolderInfo: creditCardData ? {
            name: formData.cardName,
            email: userProfile.email,
            cpfCnpj: formData.cpf.replace(/\D/g, ''),
            postalCode: formData.cardHolderCep.replace(/\D/g, ''),
            addressNumber: formData.cardHolderAddressNumber,
            phone: formData.phone.replace(/\D/g, ''),
          } : undefined,
          termsAccepted: true,
          termsVersion: TERMS_VERSION,
          userId: userProfile.id,
          // Browser context for server-side CAPI deduplication
          trackingContext: {
            fbp: getFbpCookie(),
            fbc: getFbcCookie(),
            client_id: getGaCid(),
            event_id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_agent: navigator.userAgent,
            page_location: window.location.href,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao processar pagamento');
      }

      const data = response.data;

      if (data.error) {
        throw new Error(data.error);
      }

      // Mark cart as converted when payment initiated
      await supabase
        .from('abandoned_carts')
        .update({ 
          status: paymentMethod === 'credit_card' && data.status === 'CONFIRMED' ? 'converted' : 'recovered',
          recovered_at: new Date().toISOString(),
        })
        .eq('user_id', userProfile.id)
        .eq('cart_type', plan.id)
        .eq('status', 'active');

      if (paymentMethod === 'credit_card' && data.status === 'CONFIRMED') {
        trackPurchase(data.transactionId, plan.id, plan.name, finalAmountCents, 'credit_card', appliedCoupon?.code, buyer);
        toast.success('Pagamento aprovado! Redirecionando...');
        navigate('/login?payment=success');
      } else {
        setPaymentResult({
          transactionId: data.transactionId,
          method: paymentMethod,
          pixQrCode: data.pixQrCode,
          pixPayload: data.pixPayload,
          invoiceUrl: data.invoiceUrl,
        });
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const PlanIcon = plan.icon;

  // Show payment result screen for PIX/Boleto
  if (paymentResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Orlando Fast Pass" className="h-10" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              Compra segura
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Pedido criado!</CardTitle>
              <CardDescription>
                {paymentResult.method === 'pix' 
                  ? 'Escaneie o QR Code ou copie o código PIX para pagar'
                  : 'Pagamento processado com sucesso'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentResult.method === 'pix' && paymentResult.pixQrCode && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                    <img 
                      src={`data:image/png;base64,${paymentResult.pixQrCode}`} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                  
                  {paymentResult.pixPayload && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Código PIX Copia e Cola:</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={paymentResult.pixPayload} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(paymentResult.pixPayload!)}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-600">
                      ⏱️ O código PIX expira em 30 minutos. Após a confirmação do pagamento, seu acesso será liberado automaticamente na sua conta atual.
                    </p>
                  </div>
                </div>
              )}


              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao início
                  </Button>
                </Link>
                {paymentResult.invoiceUrl && (
                  <a href={paymentResult.invoiceUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver fatura
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Orlando Fast Pass" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            {/* Logged user indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground max-w-[150px] truncate hidden sm:block">
                {userProfile.email}
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Compra segura</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Finalizar compra
              </h1>
              <p className="text-muted-foreground">
                Complete os dados de pagamento para liberar seu acesso
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logged User Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{userProfile.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{userProfile.email}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* CPF Field */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados para nota fiscal</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Cupom de desconto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-600">
                            {appliedCoupon.discount_type === 'percentage' 
                              ? `${appliedCoupon.discount_value}% de desconto`
                              : `R$${(appliedCoupon.discount_value / 100).toFixed(2)} de desconto`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={removeCoupon}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={validateCoupon}
                        disabled={isValidatingCoupon}
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forma de pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
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

                  {paymentMethod === 'pix' && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <QrCode className="w-5 h-5 text-green-500 mt-0.5" />
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


                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do cartão *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nome no cartão *</Label>
                        <Input
                          id="cardName"
                          placeholder="Como está no cartão"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Validade *</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', formatExpiry(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">CVV *</Label>
                          <Input
                            id="cardCvv"
                            placeholder="000"
                            maxLength={4}
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />
                      
                      <p className="text-sm text-muted-foreground">Dados do titular do cartão (exigido pela operadora)</p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone com DDD *</Label>
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardHolderCep">CEP *</Label>
                          <Input
                            id="cardHolderCep"
                            placeholder="00000-000"
                            value={formData.cardHolderCep}
                            onChange={(e) => handleInputChange('cardHolderCep', formatCEP(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardHolderAddressNumber">Número *</Label>
                          <Input
                            id="cardHolderAddressNumber"
                            placeholder="123"
                            value={formData.cardHolderAddressNumber}
                            onChange={(e) => handleInputChange('cardHolderAddressNumber', e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms Acceptance Checkbox */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-acceptance"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor="terms-acceptance" 
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    Li e concordo com os{' '}
                    <a 
                      href="/termos-e-privacidade" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Termos de Uso e Política de Privacidade
                    </a>
                  </Label>
                </div>
                {!termsAccepted && (
                  <p className="text-xs text-destructive/80 flex items-center gap-1 ml-7">
                    <Shield className="w-3 h-3" />
                    Aceite obrigatório para continuar
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg gradient-primary text-primary-foreground rounded-xl"
                disabled={isProcessing || !termsAccepted || !turnstileToken}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Pagar R${finalPrice},{finalCents.toString().padStart(2, '0')}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Seus dados estão protegidos com criptografia SSL
              </div>
            </form>
          </div>

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
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.gradient ? 'text-secondary' : 'text-green-500'}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano {plan.name}</span>
                    <span className="text-foreground">{formatPriceBRL(originalAmountCents).formatted}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Desconto ({appliedCoupon.code})</span>
                      <span className="text-green-600">-R${(discountAmountCents / 100).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <div className="text-right">
                      {appliedCoupon && (
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          {formatPriceBRL(originalAmountCents).formatted}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground">R${finalPrice}</span>
                      <span className="text-lg text-foreground">,{finalCents.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-center">
                    <img src={asaasLogo} alt="Asaas - Plataforma de Pagamentos" className="h-14 opacity-80" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-500" />
                    Pagamento 100% seguro via Asaas
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Dados criptografados
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
