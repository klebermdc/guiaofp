import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Search, Eye, Calendar, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
}

const Admin = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isGuide, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!roleLoading && !isGuide) {
      navigate('/dashboard');
    }
  }, [roleLoading, isGuide, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isGuide) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClients(data as ClientProfile[]);
      }
      setIsLoadingClients(false);
    };

    if (isGuide) {
      fetchClients();
    }
  }, [isGuide]);

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
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  if (authLoading || roleLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isGuide) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Guia</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e visualize perfis de viagem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Perfis Completos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter((c) => (c.completion_percentage || 0) >= 80).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Viagens Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter((c) => {
                  if (!c.arrival_date) return false;
                  const arrival = new Date(c.arrival_date);
                  const now = new Date();
                  return arrival.getMonth() === now.getMonth() && arrival.getFullYear() === now.getFullYear();
                }).length}
              </div>
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
            {isLoadingClients ? (
              <div className="text-center py-8 text-muted-foreground">Carregando clientes...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Client Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Cliente</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Nome do Responsável</h3>
                    <p>{selectedClient.responsible_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                    <p>{selectedClient.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> WhatsApp
                    </h3>
                    <p>{selectedClient.whatsapp || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Tamanho do Grupo</h3>
                    <p>{selectedClient.group_size || 1} pessoa(s)</p>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Dados da Viagem
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground">Data de Chegada</h4>
                      <p>{formatDate(selectedClient.arrival_date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">Data de Partida</h4>
                      <p>{formatDate(selectedClient.departure_date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Hotel
                      </h4>
                      <p>{selectedClient.hotel || 'Não informado'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">Parques</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedClient.parks?.length ? (
                          selectedClient.parks.map((park) => (
                            <Badge key={park} variant="outline" className="text-xs">
                              {park}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Não selecionados</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travelers */}
                {selectedClient.travelers && selectedClient.travelers.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Viajantes
                    </h3>
                    <div className="space-y-2">
                      {selectedClient.travelers.map((traveler: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-2 bg-muted/50 rounded">
                          <span className="font-medium">{traveler.name}</span>
                          <Badge variant="secondary">{traveler.age} anos</Badge>
                          {traveler.height && <span className="text-sm text-muted-foreground">{traveler.height}</span>}
                          {traveler.firstTimeDisney && (
                            <Badge variant="outline" className="text-xs">Primeira vez</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Progresso do Perfil</h3>
                  <div className="flex items-center gap-4">
                    <Progress value={selectedClient.completion_percentage || 0} className="flex-1" />
                    <span className="font-semibold">{selectedClient.completion_percentage || 0}%</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Admin;
