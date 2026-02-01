import { useState, useEffect, forwardRef } from 'react';
import { Bell, BellOff, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIOSPushSupport } from '@/hooks/useIOSPushSupport';
import { IOSInstallPrompt } from './IOSInstallPrompt';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const PushNotificationPrompt = forwardRef<HTMLDivElement>((_, ref) => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const { isIOS, needsInstallation, canReceivePush } = useIOSPushSupport();
  const effectivelySupported = isIOS ? canReceivePush : isSupported;
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before - but only for 7 days
    const dismissedAt = localStorage.getItem('push-prompt-dismissed-at');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDaysMs) {
        setIsDismissed(true);
        return;
      } else {
        // Expired, remove the flag
        localStorage.removeItem('push-prompt-dismissed-at');
      }
    }

    // Permission already blocked → don't keep showing an "activate" prompt.
    if (permission === 'denied') {
      setShowPrompt(false);
      return;
    }

    // iOS users who need to install the PWA first
    if (isIOS && needsInstallation && !isSubscribed) {
      setShowIOSPrompt(true);
      return;
    }

    if (effectivelySupported && permission === 'default' && !isSubscribed) {
      setShowPrompt(true);
    }
  }, [isSupported, permission, isSubscribed, isIOS, needsInstallation, canReceivePush, effectivelySupported]);

  const handleSubscribe = async () => {
    const result = await subscribe();
    if (result.success) {
      toast.success('Notificações ativadas! Você receberá alertas importantes.');
      setShowPrompt(false);
    } else {
      const err = result.error || '';
      if (err.includes('Notification permission denied')) {
        toast.error(
          isIOS
            ? 'Notificações bloqueadas no iPhone. Vá em Ajustes → Notificações → guiaofp e ative.'
            : 'Notificações bloqueadas. Ative nas configurações do navegador.'
        );
        setShowPrompt(false);
        return;
      }
      toast.error(result.error || 'Erro ao ativar notificações');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    // Store timestamp instead of boolean - prompt will reappear after 7 days
    localStorage.setItem('push-prompt-dismissed-at', Date.now().toString());
  };

  const handleUnsubscribe = async () => {
    const result = await unsubscribe();
    if (result.success) {
      toast.success('Notificações desativadas');
    } else {
      toast.error(result.error || 'Erro ao desativar notificações');
    }
  };

  // Show iOS installation prompt
  if (showIOSPrompt && !isDismissed) {
    return (
      <IOSInstallPrompt 
        onDismiss={() => {
          setShowIOSPrompt(false);
          setIsDismissed(true);
          localStorage.setItem('push-prompt-dismissed-at', Date.now().toString());
        }} 
      />
    );
  }

  if (!effectivelySupported || isDismissed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
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
});

PushNotificationPrompt.displayName = 'PushNotificationPrompt';

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
  
  const { isIOS, needsInstallation, canReceivePush, isStandalone } = useIOSPushSupport();

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

  // iOS user needs to install PWA first
  if (isIOS && needsInstallation) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10">
        <BellOff className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Instalação necessária</p>
          <p className="text-xs text-muted-foreground">
            Para notificações no iPhone/iPad, adicione o app à tela inicial via Safari (Compartilhar → Adicionar à Tela Inicial)
          </p>
        </div>
      </div>
    );
  }

  // Check effective support (considering iOS requirements)
  const effectivelySupported = isIOS ? canReceivePush : isSupported;

  if (!effectivelySupported) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Notificações não suportadas</p>
          <p className="text-xs text-muted-foreground">
            {isIOS 
              ? 'Requer Safari 16.4+ e o app instalado na tela inicial' 
              : 'Seu navegador não suporta notificações push'}
          </p>
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
          <p className="text-xs text-muted-foreground">
            {isIOS 
              ? 'Vá em Ajustes → [App] → Notificações para ativar'
              : 'Ative nas configurações do navegador'}
          </p>
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
