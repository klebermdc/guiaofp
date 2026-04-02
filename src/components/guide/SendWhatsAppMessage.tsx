import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { ClientProfile } from '@/types/shared';

interface SendWhatsAppMessageProps {
  clients: ClientProfile[];
}

const MESSAGE_TEMPLATES = [
  {
    id: 'multipass_purchased',
    label: '✅ MultiPass Comprado',
    template: 'multipass_purchased',
  },
  {
    id: 'park_reminder',
    label: '📅 Lembrete de Parque',
    template: 'park_reminder',
  },
  {
    id: 'custom',
    label: '✏️ Mensagem Personalizada',
    template: 'custom',
  },
];

export const SendWhatsAppMessage = ({ clients }: SendWhatsAppMessageProps) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filter clients with WhatsApp numbers
  const clientsWithWhatsApp = clients.filter(c => c.whatsapp);

  const handleSend = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }

    const client = clients.find(c => c.user_id === selectedClient);
    if (!client?.whatsapp) {
      toast.error('Cliente não tem WhatsApp cadastrado');
      return;
    }

    if (selectedTemplate === 'custom' && !customMessage.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    setIsSending(true);

    try {
      const body: Record<string, unknown> = {
        user_id: selectedClient,
      };

      if (selectedTemplate === 'custom') {
        body.message = customMessage;
      } else {
        body.template = selectedTemplate;
        body.template_data = {
          name: client.responsible_name || 'Cliente',
          date: client.arrival_date || '',
          park: 'Magic Kingdom', // Could be dynamic based on planner
          multipass_status: 'confirmado',
        };
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body,
      });

      if (error) throw error;

      if (data?.success) {
        const providerStatus = String(
          data?.provider_status ?? data?.provider_response?.status ?? ''
        ).toLowerCase();
        const providerToken = data?.provider_token ?? data?.provider_response?.token;

        const toMasked = data?.to_phone_masked || (client.whatsapp ? `${client.whatsapp}` : '');
        const base = `WhatsApp aceito para ${client.responsible_name || client.email}${toMasked ? ` (${toMasked})` : ''}`;

        if (providerStatus === 'offline') {
          toast.warning(`${base} (status: offline)${providerToken ? ` • ${providerToken}` : ''}`);
        } else if (providerStatus) {
          toast.success(`${base} (status: ${providerStatus})${providerToken ? ` • ${providerToken}` : ''}`);
        } else {
          toast.success(base);
        }

        setCustomMessage('');
        setSelectedClient('');
      } else {
        throw new Error(data?.error || 'Erro ao enviar');
      }
    } catch (err) {
      console.error('WhatsApp error:', err);
      toast.error('Erro ao enviar WhatsApp. Verifique os logs.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Enviar WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Cliente</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientsWithWhatsApp.map((client) => (
                <SelectItem key={client.user_id} value={client.user_id}>
                  <span className="flex items-center gap-2">
                    {client.responsible_name || client.email}
                    <span className="text-xs text-muted-foreground">
                      ({client.whatsapp})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clientsWithWhatsApp.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum cliente com WhatsApp cadastrado
            </p>
          )}
        </div>

        {/* Template Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TEMPLATES.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.template}>
                  {tpl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Message */}
        {selectedTemplate === 'custom' && (
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
            <Textarea
              placeholder="Digite sua mensagem..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {/* Template Preview */}
        {selectedTemplate !== 'custom' && selectedClient && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="text-xs text-muted-foreground mb-1">Prévia:</p>
            {selectedTemplate === 'multipass_purchased' && (
              <p className="whitespace-pre-line">
                🎢 *Parabéns, {clients.find(c => c.user_id === selectedClient)?.responsible_name}!*{'\n\n'}
                Confirmamos a compra do seu *Lightning Lane Multi Pass*...
              </p>
            )}
            {selectedTemplate === 'park_reminder' && (
              <p className="whitespace-pre-line">
                📅 *Lembrete de Parque*{'\n\n'}
                Olá, {clients.find(c => c.user_id === selectedClient)?.responsible_name}!{'\n'}
                Amanhã é seu dia no parque! 🎉
              </p>
            )}
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || !selectedClient}
          className="w-full gap-2"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Enviar WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
};
