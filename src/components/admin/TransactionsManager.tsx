import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Receipt, 
  Search, 
  ExternalLink, 
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Barcode,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  user_id: string;
  email: string;
  customer_name: string;
  plan_key: string;
  amount_cents: number;
  payment_method: string;
  status: string;
  asaas_payment_id: string | null;
  asaas_invoice_url: string | null;
  asaas_boleto_url: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmado', variant: 'default', icon: CheckCircle2 },
  received: { label: 'Recebido', variant: 'default', icon: CheckCircle2 },
  overdue: { label: 'Vencido', variant: 'destructive', icon: XCircle },
  refunded: { label: 'Reembolsado', variant: 'outline', icon: RefreshCw },
  failed: { label: 'Falhou', variant: 'destructive', icon: XCircle },
};

const paymentMethodConfig: Record<string, { label: string; icon: typeof QrCode }> = {
  pix: { label: 'PIX', icon: QrCode },
  boleto: { label: 'Boleto', icon: Barcode },
  credit_card: { label: 'Cartão', icon: CreditCard },
};

export function TransactionsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const filteredTransactions = transactions?.filter((t) => {
    const matchesSearch = 
      t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.asaas_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || t.payment_method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate stats
  const stats = {
    total: transactions?.length || 0,
    confirmed: transactions?.filter(t => t.status === 'confirmed' || t.status === 'received').length || 0,
    pending: transactions?.filter(t => t.status === 'pending').length || 0,
    revenue: transactions
      ?.filter(t => t.status === 'confirmed' || t.status === 'received')
      .reduce((sum, t) => sum + t.amount_cents, 0) || 0,
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>
                  Histórico de pagamentos e cobranças
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                <p className="text-xs text-muted-foreground">Receita</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos métodos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="credit_card">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Carregando...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions?.map((transaction) => {
                      const statusInfo = statusConfig[transaction.status] || statusConfig.pending;
                      const methodInfo = paymentMethodConfig[transaction.payment_method] || paymentMethodConfig.pix;
                      const StatusIcon = statusInfo.icon;
                      const MethodIcon = methodInfo.icon;

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{transaction.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{transaction.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.plan_key === 'premium' ? 'default' : 'secondary'}>
                              {transaction.plan_key === 'premium' ? 'Premium' : 'Básico'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MethodIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{methodInfo.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(transaction.amount_cents)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {format(new Date(transaction.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), "HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
