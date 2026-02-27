import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactFormDialog = ({ open, onOpenChange }: ContactFormDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        },
      });

      if (error) throw error;

      setSent(true);
      toast.success('Mensagem enviada com sucesso!');

      setTimeout(() => {
        setSent(false);
        setName('');
        setEmail('');
        setMessage('');
        onOpenChange(false);
      }, 2500);
    } catch (err) {
      console.error('Error sending contact:', err);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="w-5 h-5 text-primary" />
            Fale Conosco
          </DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo e entraremos em contato por email.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-foreground">Mensagem enviada!</p>
            <p className="text-sm text-muted-foreground">Entraremos em contato em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nome</Label>
              <Input
                id="contact-name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Mensagem</Label>
              <Textarea
                id="contact-message"
                placeholder="Como podemos ajudar?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={sending}>
              <Send className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
