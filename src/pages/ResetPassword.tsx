import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const emailSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
});

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      });

      if (resetError) {
        throw resetError;
      }

      setIsSuccess(true);
      toast.success('Email enviado com sucesso!');
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error('Erro ao enviar email. Tente novamente.');
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
          <Link to="/">
            <img 
              src={logo} 
              alt="Orlando Fast Pass Planejador" 
              className="w-64 h-auto mx-auto animate-float"
            />
          </Link>
        </div>

        <Card variant="premium" className="overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
          
          {isSuccess ? (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl">Email enviado!</CardTitle>
                <CardDescription className="text-base">
                  Enviamos um link de recuperação para <strong>{email}</strong>. 
                  Verifique sua caixa de entrada e spam.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/login">
                  <Button variant="outline" className="w-full" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Recuperar senha</CardTitle>
                <CardDescription className="text-base">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        className={`pl-10 h-12 ${error ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
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
                        Enviando...
                      </span>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <Link to="/login">
                    <Button variant="ghost" className="w-full" size="lg">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
