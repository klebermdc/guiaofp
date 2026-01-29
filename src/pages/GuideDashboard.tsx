// Guide Dashboard v2.1 - Fixed React dispatcher issue
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Settings,
  FileText,
  Users,
  Headphones,
  RefreshCw,
  CalendarDays,
  LayoutGrid,
  Bell,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GuideStatsCards } from '@/components/guide/GuideStatsCards';
import { ClientPortfolioCard } from '@/components/guide/ClientPortfolioCard';
import { GuideCalendar } from '@/components/guide/GuideCalendar';
import { SendPushNotification } from '@/components/guide/SendPushNotification';
import { SendWhatsAppMessage } from '@/components/guide/SendWhatsAppMessage';
import { CreatePremiumClient } from '@/components/guide/CreatePremiumClient';
import { useGuideMultipassStatus } from '@/hooks/useGuideMultipassStatus';
import logo from '@/assets/logo.png';
import type { ClientProfile } from '@/types/shared';

interface AttractionCount {
  user_id: string;
  count: number;
}

const GuideDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [attractionCounts, setAttractionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGuide, setFilterGuide] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'calendar' | 'notifications'>('cards');
  const { statuses: multipassStatuses, getStatusForUser } = useGuideMultipassStatus();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('arrival_date', { ascending: true });

    if (!profilesError && profilesData) {
      setClients(profilesData as ClientProfile[]);
    }

    // Fetch attraction counts
    const { data: attractionsData } = await supabase
      .from('attraction_preferences')
      .select('user_id');

    if (attractionsData) {
      const counts: Record<string, number> = {};
      attractionsData.forEach((a: { user_id: string }) => {
        counts[a.user_id] = (counts[a.user_id] || 0) + 1;
      });
      setAttractionCounts(counts);
    }

    setIsLoading(false);
  };

  // Get today's date for filtering completed trips
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter out clients whose trips have ended (departure_date < today)
  const activeClients = clients.filter((client) => {
    if (!client.departure_date) return true; // Keep clients without departure date
    const departure = new Date(client.departure_date);
    departure.setHours(23, 59, 59, 999);
    return departure >= today;
  });

  // Filter and sort clients
  const filteredClients = activeClients
    .filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        client.responsible_name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.whatsapp?.includes(searchTerm);

      if (!matchesSearch) return false;

      // Guide filter
      if (filterGuide !== 'all') {
        const clientGuide = (client.guide_name || '').toLowerCase().trim();
        if (clientGuide !== filterGuide.toLowerCase()) return false;
      }

      switch (filterStatus) {
        case 'access-enabled':
          return client.is_access_enabled;
        case 'access-blocked':
          return !client.is_access_enabled;
        case 'complete':
          return (client.completion_percentage || 0) >= 80;
        case 'incomplete':
          return (client.completion_percentage || 0) < 80;
        case 'upcoming':
          if (!client.arrival_date) return false;
          const arrival = new Date(client.arrival_date);
          const todayCheck = new Date();
          const diffDays = Math.ceil((arrival.getTime() - todayCheck.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 30;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Always sort by arrival date chronologically first
      if (!a.arrival_date) return 1;
      if (!b.arrival_date) return -1;
      return new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime();
    });

  // Calculate stats (use activeClients instead of all clients)
  const stats = {
    total: activeClients.length,
    accessEnabled: activeClients.filter(c => c.is_access_enabled).length,
    complete: activeClients.filter(c => (c.completion_percentage || 0) >= 80).length,
    tripsThisMonth: activeClients.filter(c => {
      if (!c.arrival_date) return false;
      const arrival = new Date(c.arrival_date);
      const now = new Date();
      return arrival.getMonth() === now.getMonth() && arrival.getFullYear() === now.getFullYear();
    }).length,
    upcomingTrips: activeClients.filter(c => {
      if (!c.arrival_date) return false;
      const arrival = new Date(c.arrival_date);
      const todayCheck = new Date();
      const diffDays = Math.ceil((arrival.getTime() - todayCheck.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).length,
    incompleteProfiles: activeClients.filter(c => (c.completion_percentage || 0) < 50 && c.is_access_enabled).length,
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Watermark Logo */}
        <div className="fixed bottom-8 right-8 opacity-10 pointer-events-none z-0 hidden lg:block">
          <img src={logo} alt="" className="w-48 h-auto" />
        </div>

        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-magic opacity-20 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-5 h-5" />
                <span className="text-secondary text-sm font-medium">Painel do Guia</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Guia'}!
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Gerencie seus clientes e acompanhe os preparativos
              </p>
            </div>
            
            <div className="flex gap-2">
              <CreatePremiumClient onClientCreated={fetchData} />
              <Link to="/admin">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <GuideStatsCards stats={stats} />

        {/* View Mode Toggle + Guide Filter */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Select value={filterGuide} onValueChange={setFilterGuide}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Guia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Guias</SelectItem>
              <SelectItem value="rafael">Rafael</SelectItem>
              <SelectItem value="kleber">Kleber</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              Calendário
            </Button>
            <Button
              variant={viewMode === 'notifications' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('notifications')}
              className="gap-2"
            >
              <Bell className="w-4 h-4" />
              Notificações
            </Button>
          </div>
        </div>

        {/* Notifications View */}
        {viewMode === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <SendPushNotification clients={clients} />
            <SendWhatsAppMessage clients={clients} />
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <GuideCalendar clients={activeClients} filterGuide={filterGuide} />
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Prontuário de Clientes
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="access-enabled">Com acesso</SelectItem>
                      <SelectItem value="access-blocked">Sem acesso</SelectItem>
                      <SelectItem value="complete">Perfil completo</SelectItem>
                      <SelectItem value="incomplete">Perfil incompleto</SelectItem>
                      <SelectItem value="upcoming">Viagem próxima</SelectItem>
                    </SelectContent>
                  </Select>


                  <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredClients.map((client) => (
                    <ClientPortfolioCard 
                      key={client.user_id} 
                      client={client}
                      attractionCount={attractionCounts[client.user_id] || 0}
                      onDeleted={fetchData}
                      multipassStatus={getStatusForUser(client.user_id)}
                    />
                  ))}
                </div>
              )}
              
              {filteredClients.length > 0 && (
                <p className="text-sm text-muted-foreground text-center mt-6">
                  Mostrando {filteredClients.length} de {activeClients.length} clientes ativos
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default GuideDashboard;
