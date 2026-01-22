import { useState } from 'react';
import { Bell, Send, Loader2, CheckCircle, Users, Sparkles } from 'lucide-react';
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

const MESSAGE_TEMPLATES = [
  {
    id: 'multipass-reminder',
    name: '🎫 Lembrete MultiPass',
    title: 'Hora de comprar seu MultiPass!',
    body: 'Não esqueça de acessar o app My Disney Experience e adquirir seu Lightning Lane MultiPass para aproveitar ao máximo seu dia de parque!'
  },
  {
    id: 'park-day',
    name: '🏰 Dia de Parque',
    title: 'Hoje é dia de magia!',
    body: 'Prepare-se para um dia incrível! Lembre-se de chegar cedo, usar protetor solar e manter o celular carregado. Divirta-se!'
  },
  {
    id: 'profile-reminder',
    name: '📝 Complete seu Perfil',
    title: 'Complete seu perfil de viagem',
    body: 'Percebemos que seu perfil ainda está incompleto. Preencha todas as informações para que possamos preparar o roteiro perfeito!'
  },
  {
    id: 'checkin-reminder',
    name: '✈️ Check-in Viagem',
    title: 'Lembrete de Check-in',
    body: 'Sua viagem está chegando! Não esqueça de fazer o check-in online da sua companhia aérea com 24h de antecedência.'
  },
  {
    id: 'park-tips',
    name: '💡 Dica do Dia',
    title: 'Dica especial para você!',
    body: 'Chegue ao parque 30 minutos antes da abertura oficial. Isso permite que você entre na área de entrada e esteja pronto para correr para as atrações!'
  },
  {
    id: 'weather-alert',
    name: '🌧️ Alerta Clima',
    title: 'Atenção ao clima de hoje',
    body: 'Previsão de chuva para hoje! Leve uma capa de chuva ou poncho - são mais práticos que guarda-chuva nos parques.'
  },
  {
    id: 'custom',
    name: '✏️ Mensagem Personalizada',
    title: '',
    body: ''
  }
];

export function SendPushNotification({ clients }: SendPushNotificationProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setBody(template.body);
    }
  };

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
          <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Template
          </label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolher template..." />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
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
