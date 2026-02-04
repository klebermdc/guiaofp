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
  CreditCard, 
  DollarSign, 
  Clock, 
  QrCode,
  Barcode,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  user_id: string | null;
  email: string;
  customer_name: string;
  plan_key: string;
  amount_cents: number;
  payment_method: string;
  status: string;
  asaas_invoice_url: string | null;
  asaas_boleto_url: string | null;
  created_at: string;
  updated_at: string;
  metadata: {
    phone?: string;
  } | null;
}

// Format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Get status badge info
function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return { variant: 'outline' as const, label: 'Aguardando', icon: Clock, color: 'text-yellow-500' };
    case 'CONFIRMED':
    case 'RECEIVED':
      return { variant: 'default' as const, label: 'Pago', icon: CheckCircle2, color: 'text-green-500' };
    case 'OVERDUE':
      return { variant: 'destructive' as const, label: 'Vencido', icon: AlertCircle, color: 'text-red-500' };
    case 'REFUNDED':
      return { variant: 'secondary' as const, label: 'Reembolsado', icon: XCircle, color: 'text-gray-500' };
    case 'CANCELLED':
      return { variant: 'secondary' as const, label: 'Cancelado', icon: XCircle, color: 'text-gray-500' };
    default:
      return { variant: 'outline' as const, label: status, icon: Clock, color: 'text-muted-foreground' };
  }
}

// Get payment method icon and label
function getPaymentMethodInfo(method: string) {
  switch (method) {
    case 'PIX':
      return { icon: QrCode, label: 'PIX', color: 'text-emerald-500' };
    case 'BOLETO':
      return { icon: Barcode, label: 'Boleto', color: 'text-blue-500' };
    case 'CREDIT_CARD':
      return { icon: CreditCard, label: 'Cartão', color: 'text-purple-500' };
    default:
      return { icon: CreditCard, label: method, color: 'text-muted-foreground' };
  }
}

// Get plan label
function getPlanLabel(planKey: string): string {
  return planKey === 'premium' ? '🌟 Guia Premium' : '📋 Básico';
}

export function PendingPaymentsManager() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch pending transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['pending-payments-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['PENDING', 'OVERDUE'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Calculate metrics
  const metrics = {
    totalPending: transactions?.filter(t => t.status === 'PENDING').length || 0,
    totalOverdue: transactions?.filter(t => t.status === 'OVERDUE').length || 0,
    pendingValue: transactions?.filter(t => t.status === 'PENDING')
      .reduce((sum, t) => sum + (t.amount_cents || 0), 0) || 0,
    pixPending: transactions?.filter(t => t.payment_method === 'PIX' && t.status === 'PENDING').length || 0,
    boletoPending: transactions?.filter(t => t.payment_method === 'BOLETO' && t.status === 'PENDING').length || 0,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Lista atualizada');
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
              Aguardando Pagamento
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pixPending} PIX • {metrics.boletoPending} Boleto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Pendente
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.pendingValue)}</div>
            <p className="text-xs text-muted-foreground">
              Em pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PIX Pendentes
            </CardTitle>
            <QrCode className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pixPending}</div>
            <p className="text-xs text-muted-foreground">
              Expiram em 30 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencidos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.totalOverdue}</div>
            <p className="text-xs text-muted-foreground">
              Boletos não pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pagamentos Pendentes</h3>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const statusInfo = getStatusBadge(transaction.status);
                  const StatusIcon = statusInfo.icon;
                  const paymentInfo = getPaymentMethodInfo(transaction.payment_method);
                  const PaymentIcon = paymentInfo.icon;
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {transaction.customer_name || 'Não informado'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {transaction.email}
                          </p>
                          {transaction.metadata?.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {transaction.metadata.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {getPlanLabel(transaction.plan_key)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PaymentIcon className={`h-4 w-4 ${paymentInfo.color}`} />
                          <span className="text-sm">{paymentInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {formatCurrency(transaction.amount_cents)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {transaction.asaas_invoice_url && (
                            <a 
                              href={transaction.asaas_invoice_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {transaction.asaas_boleto_url && (
                            <a 
                              href={transaction.asaas_boleto_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Barcode className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
                    <p>Nenhum pagamento pendente</p>
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
