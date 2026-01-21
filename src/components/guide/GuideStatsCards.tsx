import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Plane, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuideStats {
  total: number;
  accessEnabled: number;
  complete: number;
  tripsThisMonth: number;
  upcomingTrips: number;
  incompleteProfiles: number;
}

interface GuideStatsCardsProps {
  stats: GuideStats;
}

export function GuideStatsCards({ stats }: GuideStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <p className="text-xs text-muted-foreground">clientes</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Acesso</CardTitle>
          <ShieldCheck className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.accessEnabled}</div>
          <p className="text-xs text-muted-foreground">liberados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completo</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.complete}</div>
          <p className="text-xs text-muted-foreground">perfis 80%+</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Este mês</CardTitle>
          <Plane className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.tripsThisMonth}</div>
          <p className="text-xs text-muted-foreground">viagens</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-info/10 to-transparent border-info/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Próximos</CardTitle>
          <TrendingUp className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.upcomingTrips}</div>
          <p className="text-xs text-muted-foreground">7 dias</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Atenção</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.incompleteProfiles}</div>
          <p className="text-xs text-muted-foreground">incompletos</p>
        </CardContent>
      </Card>
    </div>
  );
}
