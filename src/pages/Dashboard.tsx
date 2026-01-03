import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MessageCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Lock,
  MapPin,
  Hotel,
  Plane
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user, travelProfile } = useAuth();
  
  const getStatusIcon = () => {
    if (travelProfile.isLocked) return <Lock className="w-5 h-5" />;
    if (travelProfile.completionPercentage >= 100) return <CheckCircle2 className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (travelProfile.isLocked) return 'Perfil bloqueado';
    if (travelProfile.completionPercentage >= 100) return 'Perfil completo';
    return 'Perfil incompleto';
  };

  const getStatusColor = () => {
    if (travelProfile.isLocked) return 'border-l-muted-foreground';
    if (travelProfile.completionPercentage >= 100) return 'border-l-success';
    return 'border-l-warning';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-magic opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-secondary text-sm font-medium">Área Exclusiva</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Visitante'}!
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Sua viagem está sendo preparada ✨
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/perfil" className="block">
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Perfil da Viagem</h3>
                  <p className="text-sm text-muted-foreground">Completar ou editar</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/agenda" className="block">
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 gradient-magic rounded-xl flex items-center justify-center text-accent-foreground">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Agenda do Guiamento</h3>
                  <p className="text-sm text-muted-foreground">Ver programação</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <a 
            href="https://wa.me/5500000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(142_70%_45%)] rounded-xl flex items-center justify-center text-white">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Falar com meu Guia</h3>
                  <p className="text-sm text-muted-foreground">WhatsApp direto</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Status */}
          <Card variant="status" className={getStatusColor()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon()}
                  Status do Perfil
                </CardTitle>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  travelProfile.completionPercentage >= 100 
                    ? 'bg-success/10 text-success' 
                    : 'bg-warning/10 text-warning'
                }`}>
                  {getStatusText()}
                </span>
              </div>
              <CardDescription>
                Quanto mais completo o perfil, melhor será o seu roteiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso do preenchimento</span>
                  <span className="font-semibold">{travelProfile.completionPercentage}%</span>
                </div>
                <Progress value={travelProfile.completionPercentage} className="h-2" />
                
                {travelProfile.completionPercentage < 100 && (
                  <Link to="/perfil">
                    <Button variant="gold" size="sm" className="mt-4">
                      Completar meu perfil
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trip Summary */}
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-accent" />
                Resumo da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {travelProfile.arrivalDate ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Datas</p>
                      <p className="font-medium">
                        {travelProfile.arrivalDate} - {travelProfile.departureDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Parques</p>
                      <p className="font-medium">
                        {travelProfile.parks.length > 0 
                          ? travelProfile.parks.join(', ')
                          : 'Não definido'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Hotel className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hospedagem</p>
                      <p className="font-medium">
                        {travelProfile.hotel || 'Não definido'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Preencha seu perfil de viagem para ver o resumo
                  </p>
                  <Link to="/perfil">
                    <Button variant="outline">
                      Preencher agora
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp CTA */}
        <Card className="overflow-hidden border-0 gradient-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-display text-2xl font-bold mb-2">
                  Precisa de ajuda?
                </h3>
                <p className="text-primary-foreground/80">
                  Seu guia está disponível para tirar todas as suas dúvidas em tempo real.
                </p>
              </div>
              <a 
                href="https://wa.me/5500000000000" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="xl">
                  <MessageCircle size={24} />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
