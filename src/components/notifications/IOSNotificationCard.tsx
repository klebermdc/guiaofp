import { Bell, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIOSPushSupport } from '@/hooks/useIOSPushSupport';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function IOSNotificationCard() {
  const { isSubscribed, subscribe, isLoading } = usePushNotifications();
  const { isIOS, isStandalone, canReceivePush } = useIOSPushSupport();
  const [isActivating, setIsActivating] = useState(false);

  // Only show for iOS users in standalone mode who haven't subscribed yet
  if (!isIOS || !isStandalone || !canReceivePush || isSubscribed) {
    return null;
  }

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const result = await subscribe();
      if (result.success) {
        toast.success('🎉 Notificações ativadas! Você receberá alertas importantes sobre sua viagem.');
      } else {
        toast.error(result.error || 'Erro ao ativar notificações. Tente novamente.');
      }
    } catch (error) {
      console.error('Error activating notifications:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">iPhone/iPad</span>
            </div>
            <h4 className="font-semibold text-foreground">Ative as Notificações</h4>
            <p className="text-sm text-muted-foreground">
              Receba lembretes do MultiPass e alertas importantes da sua viagem
            </p>
          </div>
          
          <Button 
            onClick={handleActivate}
            disabled={isLoading || isActivating}
            className="shrink-0 gap-2"
            size="sm"
          >
            {isLoading || isActivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Ativar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Success state to show after activation
export function NotificationSuccessCard() {
  const { isSubscribed } = usePushNotifications();
  const { isIOS, isStandalone } = useIOSPushSupport();

  // Show briefly after activation on iOS
  if (!isIOS || !isStandalone || !isSubscribed) {
    return null;
  }

  return (
    <Card className="border-green-500/30 bg-green-500/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-green-600 dark:text-green-400">Notificações Ativas</p>
            <p className="text-sm text-muted-foreground">Você receberá alertas importantes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
