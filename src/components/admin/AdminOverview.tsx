import { useEffect, useState, forwardRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  UtensilsCrossed,
  FileVideo,
  Tag,
  type LucideIcon
} from 'lucide-react';

interface Stats {
  totalClients: number;
  totalTransactions: number;
  totalRevenue: number;
  activeRestaurants: number;
  totalContent: number;
  activeCoupons: number;
  totalPOIs: number;
  pendingTransactions: number;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeRestaurants: 0,
    totalContent: 0,
    activeCoupons: 0,
    totalPOIs: 0,
    pendingTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const [
          profilesRes,
          transactionsRes,
          restaurantsRes,
          contentRes,
          couponsRes,
          attractionsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('transactions').select('amount_cents, status'),
          supabase.from('restaurants').select('id', { count: 'exact', head: true }),
          supabase.from('content_items').select('id', { count: 'exact', head: true }),
          supabase.from('discount_coupons').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('attractions').select('id', { count: 'exact', head: true }),
        ]);

        if (!isMounted) return;

        const transactions = transactionsRes.data || [];
        const confirmedTransactions = transactions.filter(t => t.status === 'CONFIRMED' || t.status === 'RECEIVED');
        const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
        const totalRevenue = confirmedTransactions.reduce((sum, t) => sum + (t.amount_cents || 0), 0);

        setStats({
          totalClients: profilesRes.count || 0,
          totalTransactions: transactions.length,
          totalRevenue: totalRevenue / 100,
          activeRestaurants: restaurantsRes.count || 0,
          totalContent: contentRes.count || 0,
          activeCoupons: couponsRes.count || 0,
          totalPOIs: attractionsRes.count || 0,
          pendingTransactions: pendingTransactions.length,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards: StatCard[] = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Transações',
      value: stats.totalTransactions,
      icon: Receipt,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: stats.pendingTransactions > 0 ? `${stats.pendingTransactions} pendentes` : undefined,
    },
    {
      title: 'Cupons Ativos',
      value: stats.activeCoupons,
      icon: Tag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Restaurantes',
      value: stats.activeRestaurants,
      icon: UtensilsCrossed,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Conteúdos',
      value: stats.totalContent,
      icon: FileVideo,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'POIs no Mapa',
      value: stats.totalPOIs,
      icon: MapPin,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Visão Geral</h2>
        <p className="text-muted-foreground">
          Resumo das principais métricas do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} variant="interactive" className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-amber-500 font-medium">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard 
                icon={Users} 
                label="Gerenciar Clientes" 
                description="Visualizar e editar perfis"
              />
              <QuickActionCard 
                icon={Receipt} 
                label="Ver Transações" 
                description="Acompanhar pagamentos"
              />
              <QuickActionCard 
                icon={FileVideo} 
                label="Adicionar Conteúdo" 
                description="Criar novos materiais"
              />
              <QuickActionCard 
                icon={UtensilsCrossed} 
                label="Editar Restaurantes" 
                description="Atualizar cardápios"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusItem label="Base de Dados" status="online" />
              <StatusItem label="Autenticação" status="online" />
              <StatusItem label="Storage" status="online" />
              <StatusItem label="Edge Functions" status="online" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
}

const QuickActionCard = memo(function QuickActionCard({ icon: Icon, label, description }: QuickActionCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
});

interface StatusItemProps {
  label: string;
  status: 'online' | 'offline' | 'warning';
}

const StatusItem = forwardRef<HTMLDivElement, StatusItemProps>(function StatusItem({ label, status }, ref) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    warning: 'Atenção',
  };

  return (
    <div ref={ref} className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
        <span className="text-sm font-medium text-foreground">{statusLabels[status]}</span>
      </div>
    </div>
  );
});

StatusItem.displayName = 'StatusItem';
