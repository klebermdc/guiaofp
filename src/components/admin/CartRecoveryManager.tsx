import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Users, 
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Target,
  Gift,
  Shield,
  Zap,
  Phone
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AbandonedCart {
  id: string;
  user_id: string;
  cart_type: string;
  total_value_cents: number;
  status: string;
  created_at: string;
  last_activity_at: string;
  recovery_attempts: number;
  last_recovery_email_at: string | null;
  metadata: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  } | null;
}

interface Profile {
  responsible_name: string | null;
  email: string | null;
}

// Format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Email templates
const EMAIL_TEMPLATES = [
  {
    id: 'urgency',
    name: '⏰ Urgência',
    subject: 'Sua vaga no Orlando Fast Pass está reservada por tempo limitado!',
    description: 'Cria senso de urgência para ação imediata',
    message: `Olá {nome}!

Notamos que você estava a um passo de garantir seu planejamento perfeito para Orlando! 🎢

Sua escolha pelo plano {plano} mostra que você quer o melhor para sua viagem. Não deixe essa oportunidade escapar!

🎯 Por que fechar agora?
• Seu progresso foi salvo - continue de onde parou
• Suporte exclusivo para planejar cada detalhe
• Economize horas de pesquisa com nossas dicas de insider

Clique no botão abaixo e finalize em menos de 2 minutos!

Qualquer dúvida, estamos aqui para ajudar.

Abraços mágicos! ✨`,
  },
  {
    id: 'benefits',
    name: '🌟 Benefícios',
    subject: 'Veja tudo que você vai ganhar com o Orlando Fast Pass!',
    description: 'Destaca os benefícios e valor do plano',
    message: `Olá {nome}!

Sua viagem para Orlando merece o melhor planejamento! 🏰

Com o {plano}, você terá:

✅ Roteiros personalizados para cada dia de parque
✅ Dicas exclusivas para evitar filas
✅ Melhores horários para cada atração
✅ Sugestões de restaurantes imperdíveis
✅ Checklist completo de viagem
✅ Suporte via WhatsApp durante toda a viagem

Tudo isso por apenas {valor}!

Milhares de famílias já viveram a magia de Orlando com nossa ajuda. Agora é a sua vez! 🎉

Clique abaixo e comece a planejar sua aventura!`,
  },
  {
    id: 'fomo',
    name: '😱 FOMO',
    subject: 'Não cometa os erros que arruinam viagens para Orlando!',
    description: 'Usa o medo de perder para motivar a ação',
    message: `Olá {nome}!

Você sabia que 73% dos viajantes se arrependem de não ter planejado melhor sua viagem para Orlando? 😰

Os erros mais comuns:
❌ Perder horas em filas desnecessárias
❌ Não aproveitar os melhores horários
❌ Gastar mais do que precisava
❌ Perder atrações essenciais
❌ Chegar sem saber usar os apps dos parques

Com o {plano}, você evita TODOS esses problemas!

Não deixe sua viagem dos sonhos virar um pesadelo de planejamento.

Por apenas {valor}, você garante uma experiência perfeita.

Finalize agora e viaje tranquilo! 🚀`,
  },
  {
    id: 'support',
    name: '🤝 Suporte',
    subject: 'Precisa de ajuda para decidir? Estamos aqui!',
    description: 'Oferece suporte e esclarece dúvidas',
    message: `Olá {nome}!

Vimos que você estava interessado no {plano} e queremos ajudar! 💙

Sabemos que planejar uma viagem para Orlando pode parecer complexo. São tantos parques, atrações e opções!

Por isso, oferecemos:

📱 Suporte via WhatsApp para tirar todas as suas dúvidas
📋 Roteiros personalizados para seu perfil
⏰ Dicas de horários baseadas em dados reais
🎯 Estratégias para aproveitar ao máximo

Se você tem alguma dúvida sobre o plano ou como funciona, responda este e-mail! Teremos prazer em ajudar.

Investimento: {valor}

Estamos aqui para tornar sua viagem inesquecível! ✨`,
  },
];

export function CartRecoveryManager() {
  const queryClient = useQueryClient();
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch abandoned carts
  const { data: carts, isLoading, refetch } = useQuery({
    queryKey: ['abandoned-carts-recovery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .in('status', ['active', 'abandoned'])
        .order('last_activity_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set((data || []).map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, responsible_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(cart => ({
        ...cart,
        profile: profileMap.get(cart.user_id) as Profile | undefined,
      }));
    },
  });

  // Toggle cart selection
  const toggleCart = (cartId: string) => {
    setSelectedCarts(prev => 
      prev.includes(cartId) 
        ? prev.filter(id => id !== cartId)
        : [...prev, cartId]
    );
  };

  // Select all carts
  const selectAllCarts = () => {
    if (!carts) return;
    const validCarts = carts.filter(c => getCartEmail(c));
    if (selectedCarts.length === validCarts.length) {
      setSelectedCarts([]);
    } else {
      setSelectedCarts(validCarts.map(c => c.id));
    }
  };

  // Get email for cart
  const getCartEmail = (cart: any): string | null => {
    return cart.metadata?.contact_email || cart.profile?.email || null;
  };

  // Get name for cart
  const getCartName = (cart: any): string => {
    return cart.metadata?.contact_name || cart.profile?.responsible_name || 'Viajante';
  };

  // Get plan label
  const getPlanLabel = (type: string): string => {
    const labels: Record<string, string> = {
      basic: 'Plano Básico',
      premium: 'Guia Premium',
      plan: 'Plano',
    };
    return labels[type] || type;
  };

  // Replace template variables
  const replaceVariables = (text: string, cart: any): string => {
    return text
      .replace(/{nome}/g, getCartName(cart))
      .replace(/{plano}/g, getPlanLabel(cart.cart_type))
      .replace(/{valor}/g, formatCurrency(cart.total_value_cents));
  };

  // Send recovery emails
  const sendRecoveryEmails = async () => {
    if (selectedCarts.length === 0) {
      toast.error('Selecione pelo menos um carrinho');
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const cartId of selectedCarts) {
        const cart = carts?.find(c => c.id === cartId);
        if (!cart) continue;

        const email = getCartEmail(cart);
        if (!email) continue;

        const subject = customSubject || replaceVariables(selectedTemplate.subject, cart);
        const message = customMessage || replaceVariables(selectedTemplate.message, cart);

        try {
          const { error } = await supabase.functions.invoke('send-manual-notification', {
            body: {
              emails: [email],
              subject,
              message,
            },
          });

          if (error) throw error;

          // Update recovery attempts
          await supabase
            .from('abandoned_carts')
            .update({
              recovery_attempts: (cart.recovery_attempts || 0) + 1,
              last_recovery_email_at: new Date().toISOString(),
            })
            .eq('id', cartId);

          successCount++;
        } catch (err) {
          console.error(`Error sending to ${email}:`, err);
          errorCount++;
        }
      }

      toast.success(`Enviados: ${successCount} | Erros: ${errorCount}`);
      setSelectedCarts([]);
      setShowEmailDialog(false);
      refetch();
    } catch (error) {
      console.error('Error sending recovery emails:', error);
      toast.error('Erro ao enviar e-mails de recuperação');
    } finally {
      setIsSending(false);
    }
  };

  // Trigger automatic recovery
  const triggerAutoRecovery = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('notify-abandoned-cart');
      
      if (error) throw error;
      
      toast.success(`Recuperação automática: ${data.sent || 0} e-mails enviados`);
      refetch();
    } catch (error) {
      console.error('Error in auto recovery:', error);
      toast.error('Erro na recuperação automática');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cartsWithEmail = carts?.filter(c => getCartEmail(c)) || [];
  const totalValue = cartsWithEmail.reduce((sum, c) => sum + (c.total_value_cents || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Leads Recuperáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cartsWithEmail.length}</div>
            <p className="text-xs text-muted-foreground">Com e-mail válido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-accent-foreground" />
              Valor Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Em conversões possíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Selecionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCarts.length}</div>
            <p className="text-xs text-muted-foreground">Para envio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => setShowEmailDialog(true)}
              disabled={selectedCarts.length === 0}
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={triggerAutoRecovery}
              disabled={isSending}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSending ? 'animate-spin' : ''}`} />
              Auto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Carts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Carrinhos Abandonados</CardTitle>
              <CardDescription>Selecione os leads para enviar e-mails de recuperação</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAllCarts}>
              {selectedCarts.length === cartsWithEmail.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts && carts.length > 0 ? (
                carts.map((cart) => {
                  const email = getCartEmail(cart);
                  const hasEmail = !!email;
                  
                  return (
                    <TableRow key={cart.id} className={!hasEmail ? 'opacity-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCarts.includes(cart.id)}
                          onCheckedChange={() => toggleCart(cart.id)}
                          disabled={!hasEmail}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{getCartName(cart)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email || 'Sem e-mail'}
                          </p>
                          {(cart.metadata as { contact_phone?: string } | null)?.contact_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {(cart.metadata as { contact_phone?: string }).contact_phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cart.cart_type === 'premium' ? 'default' : 'secondary'}>
                          {getPlanLabel(cart.cart_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {formatCurrency(cart.total_value_cents)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{cart.recovery_attempts}/3</span>
                        </div>
                        {cart.last_recovery_email_at && (
                          <p className="text-xs text-muted-foreground">
                            Último: {format(new Date(cart.last_recovery_email_at), 'dd/MM HH:mm')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(cart.last_activity_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
                    <p>Nenhum carrinho abandonado no momento!</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Enviar E-mail de Recuperação
            </DialogTitle>
            <DialogDescription>
              {selectedCarts.length} lead(s) selecionado(s) para envio
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates Prontos</TabsTrigger>
              <TabsTrigger value="custom">Mensagem Personalizada</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {EMAIL_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedTemplate.id === template.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setCustomSubject('');
                      setCustomMessage('');
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prévia do Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assunto:</p>
                    <p className="font-medium">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mensagem:</p>
                    <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded-lg border">
                      {selectedTemplate.message}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * As variáveis {'{nome}'}, {'{plano}'} e {'{valor}'} serão substituídas automaticamente
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Assunto do E-mail</label>
                  <Input
                    placeholder="Ex: Sua viagem para Orlando está te esperando!"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea
                    placeholder="Digite sua mensagem personalizada..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{nome}'}, {'{plano}'} e {'{valor}'} para personalização automática
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={sendRecoveryEmails} disabled={isSending}>
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para {selectedCarts.length} Lead(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
