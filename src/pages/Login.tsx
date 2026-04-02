import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = '0x4AAAAAACs32oq0qnTFCG1M';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check for redirect parameter (used for cart recovery)
  const redirectTo = useMemo(() => searchParams.get('redirect'), [searchParams]);
  const isRecovery = useMemo(() => searchParams.get('recovery') === 'true', [searchParams]);

  useEffect(() => {
    // Only redirect if authenticated AND auth check is complete
    // Also skip redirect if we're in the middle of a login submission
    if (isAuthenticated && !authLoading && !isSubmitting) {
      // If there's a redirect param (recovery flow), save it and go there
      if (redirectTo && redirectTo.includes('/checkout')) {
        // Store the redirect for AccessBlocked page in case they get blocked
        sessionStorage.setItem('pendingCheckoutRedirect', redirectTo);
      }
      const destination = redirectTo || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, authLoading, isSubmitting, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          fieldErrors[String(err.path[0])] = err.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Verify Turnstile token
      if (!turnstileToken) {
        toast({ title: "Verificação necessária", description: "Complete a verificação de segurança.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { data: turnstileResult } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken },
      });

      if (!turnstileResult?.success) {
        toast({ title: "Verificação falhou", description: "Tente novamente.", variant: "destructive" });
        setTurnstileToken(null);
        setIsSubmitting(false);
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Bem-vindo(a)! ✨",
          description: isRecovery ? "Finalize sua compra agora!" : "Sua área de guiamento está pronta para você.",
          duration: 2000,
        });
        // Redirect to checkout if recovery, otherwise dashboard
        const destination = redirectTo || '/dashboard';
        navigate(destination, { replace: true });
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Skip to content for accessibility */}
      <a href="#login-form" className="skip-to-content sr-only focus:not-sr-only">
        Pular para o formulário
      </a>
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 gradient-magic opacity-10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 gradient-gold opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" aria-label="Voltar para página inicial">
            <img 
              src={logo} 
              alt="Orlando Fast Pass Planejador" 
              className="w-64 h-auto mx-auto animate-float"
              loading="eager"
            />
          </Link>
        </div>

        <Card variant="glass" className="overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" aria-hidden="true" />
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display">Bem-vindo(a)!</CardTitle>
            <CardDescription className="text-base">
              Acesse sua área exclusiva de guiamento remoto e prepare-se para uma viagem inesquecível.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    className="pl-10 h-12"
                    autoComplete="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <Link 
                    to="/recuperar-senha" 
                    className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    className="pl-10 pr-12 h-12"
                    autoComplete="current-password"
                    aria-describedby={errors.password ? "password-error" : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-center mt-4">
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
                className="w-full mt-4"
                disabled={isSubmitting || !turnstileToken}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar na minha área
                    <ArrowRight size={20} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Ainda não tem uma conta?
              </p>
              <Link to="/#planos">
                <Button variant="outline" className="w-full" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adquirir meu plano
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Problemas para acessar?{' '}
          <a
            href="https://wa.me/message/TRKS54CVGEGUK1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium hover:underline"
          >
            Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;