import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Mail, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AbandonedCart {
  id: string;
  user_id: string;
  cart_items: CartItem[];
  cart_type: string;
  total_value_cents: number;
  status: string;
  created_at: string;
  last_activity_at: string;
  abandoned_at: string | null;
  recovery_attempts: number;
  last_recovery_email_at: string | null;
  recovered_at: string | null;
}

interface CartItem {
  name: string;
  type: string;
  plan_key?: 'basic' | 'premium';
  price_cents?: number;
  features?: string[];
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

// Get status badge variant
function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return { variant: 'outline' as const, label: 'Ativo', icon: Clock };
    case 'abandoned':
      return { variant: 'destructive' as const, label: 'Abandonado', icon: AlertTriangle };
    case 'recovered':
      return { variant: 'default' as const, label: 'Recuperado', icon: CheckCircle2 };
    case 'converted':
      return { variant: 'secondary' as const, label: 'Convertido', icon: CheckCircle2 };
    case 'expired':
      return { variant: 'outline' as const, label: 'Expirado', icon: XCircle };
    default:
      return { variant: 'outline' as const, label: status, icon: Clock };
  }
}

// Get cart type label
function getCartTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    basic: '📋 Plano Básico',
    premium: '🌟 Guia Premium',
    plan: '📦 Plano',
  };
  return labels[type] || type;
}

export function AbandonedCartsManager() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch abandoned carts with user profiles
  const { data: carts, isLoading, refetch } = useQuery({
    queryKey: ['abandoned-carts-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('last_activity_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles for each cart
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

  // Calculate metrics
  const metrics = {
    totalAbandoned: carts?.filter(c => c.status === 'abandoned').length || 0,
    totalValue: carts?.filter(c => c.status === 'abandoned')
      .reduce((sum, c) => sum + (c.total_value_cents || 0), 0) || 0,
    recovered: carts?.filter(c => c.status === 'recovered' || c.status === 'converted').length || 0,
    todayAbandoned: carts?.filter(c => {
      if (!c.abandoned_at) return false;
      const today = new Date();
      const abandonedDate = new Date(c.abandoned_at);
      return abandonedDate.toDateString() === today.toDateString();
    }).length || 0,
  };

  // Trigger manual recovery emails
  const handleTriggerRecovery = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('notify-abandoned-cart');
      
      if (error) throw error;
      
      toast.success(`Recuperação executada: ${data.sent || 0} e-mails enviados`);
      refetch();
    } catch (error) {
      console.error('Error triggering recovery:', error);
      toast.error('Erro ao disparar recuperação de carrinhos');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carrinhos Abandonados
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAbandoned}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.todayAbandoned} abandonados hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Potencial
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Em carrinhos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recuperados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recovered}</div>
            <p className="text-xs text-muted-foreground">
              Carrinhos convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Recuperação
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carts && carts.length > 0 
                ? `${Math.round((metrics.recovered / carts.length) * 100)}%`
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dos carrinhos totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Carrinhos Recentes</h3>
        <Button 
          onClick={handleTriggerRecovery} 
          disabled={isRefreshing}
          variant="outline"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Disparar Recuperação
        </Button>
      </div>

      {/* Carts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Tentativas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts && carts.length > 0 ? (
                carts.map((cart) => {
                  const statusInfo = getStatusBadge(cart.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={cart.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {cart.profile?.responsible_name || 'Usuário'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cart.profile?.email || 'Sem e-mail'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getCartTypeLabel(cart.cart_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {Array.isArray(cart.cart_items) ? cart.cart_items.length : 0} itens
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(cart.total_value_cents)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(cart.last_activity_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{cart.recovery_attempts}/3</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum carrinho encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
