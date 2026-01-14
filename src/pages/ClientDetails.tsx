import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Star,
  AlertCircle,
  Loader2,
  Castle,
  Globe,
  Film,
  TreePine,
  Rocket,
  Waves,
  Zap,
  Heart,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  group_size: number | null;
  travelers: unknown;
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  hotel: string | null;
  hotel_type: string | null;
  has_transport: boolean | null;
  visited_before: boolean | null;
  last_visit: string | null;
  group_style: string | null;
  priority: string[] | null;
  physical_restrictions: string | null;
  food_allergies: string | null;
  has_celebration: boolean | null;
  celebration_type: string | null;
  expectations: string | null;
  concerns: string | null;
  special_requests: string | null;
  completion_percentage: number | null;
}

interface AttractionPreference {
  id: string;
  park_name: string;
  attraction_name: string;
  priority: number;
  notes: string;
}

const parkIcons: Record<string, React.ElementType> = {
  'Magic Kingdom': Castle,
  'EPCOT': Globe,
  'Hollywood Studios': Film,
  'Animal Kingdom': TreePine,
  'Universal Studios': Rocket,
  'Islands of Adventure': Waves,
  'Epic Universe': Sparkles,
};

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attractions, setAttractions] = useState<AttractionPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    if (!id) return;

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load attraction preferences
      const { data: attractionsData, error: attractionsError } = await supabase
        .from('attraction_preferences')
        .select('*')
        .eq('user_id', id)
        .order('park_name');

      if (attractionsError) throw attractionsError;
      setAttractions(attractionsData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedAttractions = attractions.reduce((acc, attr) => {
    if (!acc[attr.park_name]) {
      acc[attr.park_name] = [];
    }
    acc[attr.park_name].push(attr);
    return acc;
  }, {} as Record<string, AttractionPreference[]>);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Cliente não encontrado</h2>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {profile.responsible_name || 'Cliente'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Perfil completo: {profile.completion_percentage || 0}%
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile" className="flex-1 sm:flex-none">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="attractions" className="flex-1 sm:flex-none">
              <Star className="w-4 h-4 mr-2" />
              Atrações ({attractions.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{profile.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{profile.whatsapp || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Informações da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chegada</p>
                  <p className="font-medium">
                    {profile.arrival_date 
                      ? format(new Date(profile.arrival_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Partida</p>
                  <p className="font-medium">
                    {profile.departure_date 
                      ? format(new Date(profile.departure_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupo</p>
                  <p className="font-medium">{profile.group_size || 1} pessoas</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hotel</p>
                  <p className="font-medium">{profile.hotel || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo Hotel</p>
                  <p className="font-medium">{profile.hotel_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transporte</p>
                  <Badge variant={profile.has_transport ? 'default' : 'secondary'}>
                    {profile.has_transport ? 'Possui' : 'Não possui'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Parks */}
            {profile.parks && profile.parks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Parques Selecionados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.parks.map((park, idx) => {
                      const ParkIcon = parkIcons[park] || MapPin;
                      return (
                        <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                          <ParkIcon className="w-4 h-4 mr-1.5" />
                          {park}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Preferências e Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.priority && profile.priority.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Prioridades</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.priority.map((p, idx) => (
                        <Badge key={idx} variant="outline">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.group_style && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estilo do Grupo</p>
                    <p className="font-medium capitalize">{profile.group_style}</p>
                  </div>
                )}
                {profile.physical_restrictions && (
                  <div>
                    <p className="text-sm text-muted-foreground">Restrições Físicas</p>
                    <p className="font-medium">{profile.physical_restrictions}</p>
                  </div>
                )}
                {profile.food_allergies && (
                  <div>
                    <p className="text-sm text-muted-foreground">Alergias Alimentares</p>
                    <p className="font-medium">{profile.food_allergies}</p>
                  </div>
                )}
                {profile.has_celebration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Celebração</p>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {profile.celebration_type || 'Celebração especial'}
                    </Badge>
                  </div>
                )}
                {profile.expectations && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expectativas</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{profile.expectations}</p>
                  </div>
                )}
                {profile.concerns && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preocupações</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{profile.concerns}</p>
                  </div>
                )}
                {profile.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos Especiais</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{profile.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attractions Tab */}
          <TabsContent value="attractions" className="mt-4 space-y-4">
            {attractions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Nenhuma atração selecionada</h3>
                  <p className="text-muted-foreground">
                    O cliente ainda não selecionou suas atrações desejadas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Atrações</p>
                        <p className="text-2xl font-bold text-primary">{attractions.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Parques</p>
                        <p className="text-2xl font-bold text-primary">
                          {Object.keys(groupedAttractions).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Com Notas</p>
                        <p className="text-2xl font-bold text-primary">
                          {attractions.filter(a => a.notes).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attractions by Park */}
                {Object.entries(groupedAttractions).map(([parkName, parkAttractions]) => {
                  const ParkIcon = parkIcons[parkName] || MapPin;
                  return (
                    <Card key={parkName}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ParkIcon className="w-5 h-5 text-primary" />
                          {parkName}
                          <Badge variant="secondary" className="ml-auto">
                            {parkAttractions.length} atrações
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {parkAttractions.map((attraction) => (
                            <div 
                              key={attraction.id}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <Zap className="w-5 h-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium">{attraction.attraction_name}</p>
                                {attraction.notes && (
                                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>{attraction.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}