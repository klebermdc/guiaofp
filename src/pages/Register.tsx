import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User,
  Phone,
  ArrowLeft,
  Map,
  Crown,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { usePlanPricing, formatPriceBRL } from '@/hooks/usePlanPricing';
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = '0x4AAAAAACs32oq0qnTFCG1M';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(14, 'WhatsApp é obrigatório').max(15),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const planIcons: Record<string, typeof Map | typeof Crown> = {
  basic: Map,
  premium: Crown,
};

export default function Register() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: dbPlans, isLoading: isLoadingPlans } = usePlanPricing();

  const planKey = planId || 'basic';
  const dbPlan = dbPlans?.[planKey];
  const plan = dbPlan ? {
    id: dbPlan.plan_key,
    name: dbPlan.plan_name,
    subtitle: dbPlan.subtitle || '',
    features: dbPlan.features,
    icon: planIcons[dbPlan.plan_key] || Map,
    price_cents: dbPlan.price_cents,
  } : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Already logged in, go directly to checkout
        navigate(`/checkout/${planId || 'basic'}`, { replace: true });
      }
    };
    checkSession();
  }, [navigate, planId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form
      const validation = registerSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Verify Turnstile token
      if (!turnstileToken) {
        toast.error('Complete a verificação de segurança.');
        setIsSubmitting(false);
        return;
      }

      const { data: turnstileResult } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken },
      });

      if (!turnstileResult?.success) {
        toast.error('Verificação de segurança falhou. Tente novamente.');
        setTurnstileToken(null);
        setIsSubmitting(false);
        return;
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: formData.name,
            phone: formData.phone,
            plan_tier: planId || 'basic',
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Faça login para continuar.');
          navigate('/login');
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta');
      }

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          responsible_name: formData.name,
          whatsapp: formData.phone || null,
          plan_tier: planId || 'basic',
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Track abandoned cart with real user ID now
      try {
        await supabase.functions.invoke('track-abandoned-cart', {
          body: {
            visitor_id: authData.user.id,
            cart_type: plan?.id || 'basic',
            cart_items: plan ? [{
              name: plan.name,
              type: 'plan',
              plan_key: plan.id,
              price_cents: plan.price_cents,
              features: plan.features,
            }] : [],
            total_value_cents: plan ? plan.price_cents : 0,
            metadata: {
              contact_name: formData.name,
              contact_email: formData.email,
              contact_phone: formData.phone || null,
              is_anonymous: false,
              registered_at: new Date().toISOString(),
            },
            action: 'create_or_update',
          },
        });
      } catch (err) {
        console.error('Failed to track cart:', err);
      }

      toast.success('Conta criada! Agora finalize seu pagamento.');
      
      // Navigate to checkout
      navigate(`/checkout/${planId || 'basic'}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPlans) {
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

  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 gradient-magic opacity-10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 gradient-gold opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto relative pt-8">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <img 
              src={logo} 
              alt="Orlando Fast Pass Planejador" 
              className="w-48 h-auto mx-auto"
              loading="eager"
            />
          </Link>
        </div>

        {/* Plan Summary */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${plan.id === 'premium' ? 'gradient-gold' : 'bg-primary'}`}>
                <PlanIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{plan.name}</p>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPriceBRL(plan.price_cents).formatted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card className="overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-display">Crie sua conta</CardTitle>
            <CardDescription>
              Preencha seus dados para continuar com a compra
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                    error={!!errors.phone}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Features preview */}
              <div className="pt-2 pb-2">
                <p className="text-sm text-muted-foreground mb-2">O que você terá acesso:</p>
                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
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
                variant="premium"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !turnstileToken}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Continuar para pagamento
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-accent hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao criar sua conta, você concorda com nossos{' '}
          <Link to="/termos-e-privacidade" className="text-accent hover:underline">
            Termos de Uso e Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
