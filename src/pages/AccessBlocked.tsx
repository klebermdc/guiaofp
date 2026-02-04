import { useEffect, useState } from 'react';
import { Lock, MessageCircle, LogOut, RefreshCw, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AccessBlocked() {
  const { logout, user, loadProfile, isAccessEnabled } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // Check for pending checkout redirect from recovery flow
  const pendingCheckout = sessionStorage.getItem('pendingCheckoutRedirect');
  const redirectParam = searchParams.get('redirect');
  
  // If there's a pending checkout or redirect param, navigate immediately
  useEffect(() => {
    const checkoutPath = pendingCheckout || redirectParam;
    if (checkoutPath && checkoutPath.includes('/checkout')) {
      sessionStorage.removeItem('pendingCheckoutRedirect');
      navigate(checkoutPath, { replace: true });
    }
  }, [pendingCheckout, redirectParam, navigate]);

  const whatsappNumber = '5511999999999'; // Número de suporte
  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de me cadastrar na plataforma Orlando Fast Pass e gostaria de saber mais sobre os planos de guiamento.\n\nEmail: ${user?.email}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Check access periodically (every 10 seconds for the first 2 minutes)
  useEffect(() => {
    const checkAccess = async () => {
      await loadProfile();
      setCheckCount(prev => prev + 1);
    };

    // Initial check after 3 seconds
    const initialTimeout = setTimeout(checkAccess, 3000);

    // Then check every 10 seconds
    const interval = setInterval(() => {
      if (checkCount < 12) { // Stop after 2 minutes (12 checks * 10 seconds)
        checkAccess();
      }
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [loadProfile, checkCount]);

  // Redirect when access is enabled
  useEffect(() => {
    if (isAccessEnabled) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAccessEnabled, navigate]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    await loadProfile();
    setIsChecking(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if there's an abandoned cart for this user and show checkout button
  const handleGoToCheckout = () => {
    // Default to basic plan if we don't know which plan
    navigate('/checkout/basic');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Acesso Pendente</CardTitle>
          <CardDescription className="text-base">
            Seu cadastro foi realizado com sucesso! Complete sua compra para liberar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <RefreshCw className={`w-4 h-4 ${checkCount < 12 ? 'animate-spin' : ''}`} />
            <span>
              {checkCount < 12 
                ? 'Verificando status automaticamente...' 
                : 'Verificação automática pausada'}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Se você ainda não finalizou sua compra, clique no botão abaixo para ir ao checkout.
          </p>
          
          <div className="flex flex-col gap-3">
            {/* Primary CTA - Go to Checkout */}
            <Button 
              variant="premium" 
              onClick={handleGoToCheckout}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Finalizar Minha Compra
            </Button>

            <Button 
              variant="outline" 
              onClick={handleManualCheck} 
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Já paguei, verificar acesso
                </>
              )}
            </Button>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" className="w-full" size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com a Equipe
              </Button>
            </a>
            
            <Button variant="ghost" onClick={handleLogout} className="w-full text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Conectado como: {user?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}