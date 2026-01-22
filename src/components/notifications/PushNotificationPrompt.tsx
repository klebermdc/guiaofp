import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function PushNotificationPrompt() {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('push-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt immediately if not subscribed and permission is default
    if (isSupported && permission === 'default' && !isSubscribed) {
      setShowPrompt(true);
    }
  }, [isSupported, permission, isSubscribed]);

  const handleSubscribe = async () => {
    const result = await subscribe();
    if (result.success) {
      toast.success('Notificações ativadas! Você receberá alertas importantes.');
      setShowPrompt(false);
    } else {
      toast.error(result.error || 'Erro ao ativar notificações');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('push-prompt-dismissed', 'true');
  };

  const handleUnsubscribe = async () => {
    const result = await unsubscribe();
    if (result.success) {
      toast.success('Notificações desativadas');
    } else {
      toast.error(result.error || 'Erro ao desativar notificações');
    }
  };

  if (!isSupported || isDismissed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50"
      >
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Ativar notificações?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Receba lembretes importantes sobre sua viagem, como compra do MultiPass e dias de parque.
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    Ativar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    Agora não
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Settings component for managing notifications
export function NotificationSettings() {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe();
      if (result.success) {
        toast.success('Notificações desativadas');
      } else {
        toast.error(result.error || 'Erro ao desativar');
      }
    } else {
      const result = await subscribe();
      if (result.success) {
        toast.success('Notificações ativadas!');
      } else {
        toast.error(result.error || 'Erro ao ativar');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Notificações não suportadas</p>
          <p className="text-xs text-muted-foreground">Seu navegador não suporta notificações push</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10">
        <BellOff className="w-5 h-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">Notificações bloqueadas</p>
          <p className="text-xs text-muted-foreground">Ative nas configurações do navegador</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">Notificações Push</p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed ? 'Você receberá alertas importantes' : 'Ative para receber lembretes'}
          </p>
        </div>
      </div>
      
      <Button
        size="sm"
        variant={isSubscribed ? 'outline' : 'default'}
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          'Desativar'
        ) : (
          'Ativar'
        )}
      </Button>
    </div>
  );
}
