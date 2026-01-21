import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Users, Search, Eye, Calendar, Loader2, ShieldCheck, ShieldX, Trash2, Crown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ClientProfile {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  group_size: number | null;
  travelers: any[];
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  hotel: string | null;
  completion_percentage: number | null;
  created_at: string | null;
  is_access_enabled: boolean | null;
  plan_tier: string;
  has_contract?: boolean;
}

export function ClientsManager() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingAccess, setTogglingAccess] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setIsLoading(false);
      return;
    }

    // Fetch contracts to check which clients have one
    const { data: contractsData } = await supabase
      .from('contracts')
      .select('user_id');

    const contractUserIds = new Set(contractsData?.map(c => c.user_id) || []);

    const clientsWithContractInfo = (profilesData || []).map(profile => ({
      ...profile,
      has_contract: contractUserIds.has(profile.user_id)
    })) as ClientProfile[];

    setClients(clientsWithContractInfo);
    setIsLoading(false);
  };

  const toggleAccess = async (client: ClientProfile) => {
    setTogglingAccess(client.user_id);
    const newValue = !client.is_access_enabled;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_access_enabled: newValue })
      .eq('user_id', client.user_id);

    if (error) {
      toast.error('Erro ao atualizar acesso');
    } else {
      setClients(prev => 
        prev.map(c => 
          c.user_id === client.user_id 
            ? { ...c, is_access_enabled: newValue } 
            : c
        )
      );
      toast.success(newValue ? 'Acesso liberado!' : 'Acesso bloqueado!');

      // Send email notification when access is enabled
      if (newValue && client.email) {
        try {
          const response = await supabase.functions.invoke('notify-access-enabled', {
            body: {
              email: client.email,
              nome_completo: client.responsible_name || 'Cliente',
            },
          });
          
          if (response.error) {
            console.error('Failed to send notification:', response.error);
          } else {
            toast.success('Email de notificação enviado!');
          }
        } catch (notifyError) {
          console.error('Error sending access notification:', notifyError);
        }
      }
    }
    setTogglingAccess(null);
  };

  const updatePlanTier = async (client: ClientProfile, newTier: string) => {
    setUpdatingPlan(client.user_id);
    
    const { error } = await supabase
      .from('profiles')
      .update({ plan_tier: newTier })
      .eq('user_id', client.user_id);

    if (error) {
      toast.error('Erro ao atualizar plano');
    } else {
      setClients(prev => 
        prev.map(c => 
          c.user_id === client.user_id 
            ? { ...c, plan_tier: newTier } 
            : c
        )
      );
      const planName = newTier === 'premium' ? 'Guia Premium' : 'Básico';
      toast.success(`Plano atualizado para ${planName}`);
    }
    setUpdatingPlan(null);
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.responsible_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.whatsapp?.includes(searchTerm)
    );
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const handleViewClient = (client: ClientProfile) => {
    navigate(`/admin/cliente/${client.user_id}`);
  };

  const handleDeleteContract = async (client: ClientProfile) => {
    setDeletingClient(client.user_id);
    
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('user_id', client.user_id);
      
      if (error) throw error;
      
      toast.success(`Contrato de ${client.responsible_name || 'cliente'} excluído com sucesso`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Erro ao excluir contrato');
    } finally {
      setDeletingClient(null);
    }
  };

  const stats = {
    total: clients.length,
    complete: clients.filter((c) => (c.completion_percentage || 0) >= 80).length,
    accessEnabled: clients.filter((c) => c.is_access_enabled).length,
    thisMonth: clients.filter((c) => {
      if (!c.arrival_date) return false;
      const arrival = new Date(c.arrival_date);
      const now = new Date();
      return arrival.getMonth() === now.getMonth() && arrival.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Acesso Liberado</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accessEnabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Perfis Completos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complete}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Viagens Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Chegada</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={client.is_access_enabled || false}
                          onCheckedChange={() => toggleAccess(client)}
                          disabled={togglingAccess === client.user_id}
                        />
                        {client.is_access_enabled ? (
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <ShieldX className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={client.plan_tier || 'basic'}
                        onValueChange={(value) => updatePlanTier(client, value)}
                        disabled={updatingPlan === client.user_id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                              <span>Básico</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="premium">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-yellow-500" />
                              <span>Guia Premium</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-medium">
                      {client.responsible_name || 'Não informado'}
                    </TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.whatsapp || '-'}</TableCell>
                    <TableCell>{formatDate(client.arrival_date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.group_size || 1} pessoa(s)</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={client.completion_percentage || 0} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {client.completion_percentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        
                        {client.has_contract && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title={`Excluir contrato de ${client.responsible_name || 'cliente'}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o contrato de <strong>{client.responsible_name || 'cliente'}</strong>?
                                  <br /><br />
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteContract(client)}
                                  disabled={deletingClient === client.user_id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingClient === client.user_id ? 'Excluindo...' : 'Excluir'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
        </CardContent>
      </Card>
    </>
  );
}
