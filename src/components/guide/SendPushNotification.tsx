import { useState } from 'react';
import { Bell, Send, Loader2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  user_id: string;
  responsible_name: string | null;
  email: string | null;
}

interface SendPushNotificationProps {
  clients: Client[];
}

export function SendPushNotification({ clients }: SendPushNotificationProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha o título e a mensagem');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        user_ids: selectedUserId ? [selectedUserId] : undefined,
        payload: {
          title: title.trim(),
          body: body.trim(),
          tag: 'manual-notification',
          data: {
            url: '/',
            timestamp: new Date().toISOString()
          }
        }
      };

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload
      });

      if (error) throw error;

      const result = data as { sent: number; failed: number; expired: number };
      
      if (result.sent > 0) {
        toast.success(`Notificação enviada para ${result.sent} dispositivo(s)!`);
        setLastSent(new Date().toLocaleTimeString('pt-BR'));
        setTitle('');
        setBody('');
      } else if (result.expired > 0) {
        toast.warning('Algumas inscrições expiraram e foram removidas');
      } else {
        toast.info('Nenhum dispositivo encontrado para receber a notificação');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Erro ao enviar notificação');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter clients that might have push subscriptions
  const availableClients = clients.filter(c => c.responsible_name);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          Enviar Notificação Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Destinatário</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Todos os clientes
                </div>
              </SelectItem>
              {availableClients.map((client) => (
                <SelectItem key={client.user_id} value={client.user_id}>
                  {client.responsible_name || client.email || 'Cliente sem nome'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Título</label>
          <Input
            placeholder="Ex: Lembrete importante!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-1">{title.length}/50</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
          <Textarea
            placeholder="Ex: Não esqueça de comprar seu MultiPass hoje!"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">{body.length}/200</p>
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isLoading || !title.trim() || !body.trim()}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Notificação
            </>
          )}
        </Button>

        {lastSent && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Última enviada às {lastSent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
