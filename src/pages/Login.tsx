import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignup) {
        const validation = signupSchema.safeParse({ name, email, password });
        if (!validation.success) {
          const fieldErrors: any = {};
          validation.error.errors.forEach((err) => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const result = await signup(email, password, name);
        if (result.success) {
          toast({
            title: "Conta criada! ✨",
            description: "Bem-vindo(a) ao Orlando Fast Pass!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Erro no cadastro",
            description: result.error || "Verifique os dados e tente novamente.",
            variant: "destructive",
          });
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          const fieldErrors: any = {};
          validation.error.errors.forEach((err) => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const result = await login(email, password);
        if (result.success) {
          toast({
            title: "Bem-vindo(a)! ✨",
            description: "Sua área de guiamento está pronta para você.",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Erro no login",
            description: result.error || "Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 gradient-magic opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 gradient-gold opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-gold rounded-2xl shadow-gold mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">
            Orlando Fast Pass
          </h1>
          <p className="text-muted-foreground">Guiamento Remoto</p>
        </div>

        <Card variant="premium" className="overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isSignup ? 'Criar Conta' : 'Bem-vindo(a)!'}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignup 
                ? 'Preencha seus dados para começar sua jornada mágica.'
                : 'Acesse sua área exclusiva de guiamento remoto e prepare-se para uma viagem inesquecível.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-10 h-12 ${errors.name ? 'border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-destructive' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="premium"
                size="lg"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isSignup ? 'Criando conta...' : 'Entrando...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignup ? 'Criar minha conta' : 'Entrar na minha área'}
                    <ArrowRight size={20} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                {isSignup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setErrors({});
                  }}
                  className="text-accent font-medium hover:underline"
                >
                  {isSignup ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Problemas para acessar?{' '}
          <a
            href="https://wa.me/5500000000000"
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
