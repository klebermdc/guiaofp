import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  UtensilsCrossed, 
  Star,
  Clock,
  DollarSign,
  Loader2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Restaurant {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  latitude: number | null;
  longitude: number | null;
  menu_url: string | null;
  park_name?: string;
}

const PARKS = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', emoji: '🏰' },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', emoji: '🌍' },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', emoji: '🎬' },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', emoji: '🦁' },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', emoji: '🎢' },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', emoji: '🏝️' },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', emoji: '🌌' },
];

// Restaurant details with tips
const RESTAURANT_DETAILS: Record<string, { 
  type: 'quick-service' | 'table-service' | 'signature'; 
  priceLevel: 1 | 2 | 3 | 4;
  tip?: string;
  mustTry?: string;
  reservation?: boolean;
}> = {
  // Magic Kingdom
  'Be Our Guest Restaurant': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Reserve com 60 dias de antecedência. Decoração incrível do castelo da Fera!', mustTry: 'Grey Stuff (é delicioso!)' },
  'Cinderella\'s Royal Table': { type: 'signature', priceLevel: 4, reservation: true, tip: 'Dentro do castelo! Inclui encontro com princesas durante a refeição', mustTry: 'Menu especial de princesas' },
  'Pecos Bill': { type: 'quick-service', priceLevel: 2, tip: 'Bar de toppings grátis para personalizar seu prato. Ótimo custo-benefício!', mustTry: 'Nachos com carne' },
  'Casey\'s Corner': { type: 'quick-service', priceLevel: 1, tip: 'Hot dogs clássicos americanos na Main Street. Pianista ao vivo!', mustTry: 'Foot-Long Hot Dog' },
  'The Plaza Restaurant': { type: 'table-service', priceLevel: 2, reservation: true, tip: 'Vista para o castelo! Ambiente clássico americano', mustTry: 'Milkshakes cremosos' },
  'Liberty Tree Tavern': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Buffet estilo Thanksgiving o dia todo. Comida caseira americana', mustTry: 'Peru com todos os acompanhamentos' },
  'Skipper Canteen': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Temático do Jungle Cruise! Garçons fazem piadas', mustTry: 'Sustainable Fish' },
  'Columbia Harbour House': { type: 'quick-service', priceLevel: 2, tip: 'Segundo andar é mais tranquilo e tem ar-condicionado forte', mustTry: 'Fish and Chips ou Lobster Roll' },
  'Cosmic Ray\'s Starlight Cafe': { type: 'quick-service', priceLevel: 2, tip: 'Maior restaurante do Magic Kingdom. Show ao vivo do alien Sonny Eclipse!', mustTry: 'Rotisserie Chicken' },
  
  // EPCOT
  'Space 220': { type: 'signature', priceLevel: 4, reservation: true, tip: 'Elevador simulado até estação espacial! Vista da "Terra" do espaço', mustTry: 'Experiência completa com elevador' },
  'Le Cellier': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Pavilhão do Canadá. Melhor steak do EPCOT!', mustTry: 'Filet Mignon com Cheddar Cheese Soup' },
  'Garden Grill': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Restaurante gira lentamente! Encontro com Mickey fazendeiro', mustTry: 'Buffet familiar estilo fazenda' },
  'San Angel Inn': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Dentro da pirâmide! Céu noturno artificial o dia todo', mustTry: 'Combinação de tacos' },
  'Biergarten': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Buffet alemão com música ao vivo! Mesas comunitárias', mustTry: 'Schnitzel e Pretzels' },
  'Teppan Edo': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Show de teppanyaki na sua frente! Chef prepara na hora', mustTry: 'Filet Mignon Teppan' },
  'Via Napoli': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Fornos de pizza vindos da Itália! Tamanhos para família', mustTry: 'Pizza Margherita gigante' },
  'La Hacienda de San Angel': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Vista para a lagoa! Perfeito para fogos do EPCOT', mustTry: 'Tableside Guacamole' },
  'Connections Cafe': { type: 'quick-service', priceLevel: 2, tip: 'Novo e moderno! Starbucks incluso. Muito espaço interno', mustTry: 'Bowls saudáveis' },
  
  // Hollywood Studios
  'Oga\'s Cantina': { type: 'quick-service', priceLevel: 2, reservation: true, tip: 'Bar de Star Wars! Reserva obrigatória, máx 45min. DJ droid!', mustTry: 'Fuzzy Tauntaun (formiga na boca!)' },
  'Docking Bay 7': { type: 'quick-service', priceLevel: 2, tip: 'Melhor quick-service de Galaxy\'s Edge. Comida galáctica!', mustTry: 'Smoked Kaadu Ribs' },
  '50\'s Prime Time Cafe': { type: 'table-service', priceLevel: 2, reservation: true, tip: 'Garçonetes fazem papel de "mãe" rigorosa. Divertidíssimo!', mustTry: 'Pot Roast da mamãe' },
  'Sci-Fi Dine-In Theater': { type: 'table-service', priceLevel: 2, reservation: true, tip: 'Você come dentro de carros antigos assistindo filmes B!', mustTry: 'Milkshakes enquanto assiste' },
  'Hollywood Brown Derby': { type: 'signature', priceLevel: 4, reservation: true, tip: 'Restaurante mais elegante do parque. Réplica do original de Hollywood', mustTry: 'Cobb Salad (inventada aqui!)' },
  'Woody\'s Lunch Box': { type: 'quick-service', priceLevel: 2, tip: 'Toy Story Land! Você se sente do tamanho de um brinquedo', mustTry: 'Totchos (nachos de batata)' },
  'Backlot Express': { type: 'quick-service', priceLevel: 2, tip: 'Decoração de bastidores de filme. Opções variadas', mustTry: 'Galactic Burger' },
  'Ronto Roasters': { type: 'quick-service', priceLevel: 2, tip: 'Sanduíches grelhados por droid! Galaxy\'s Edge', mustTry: 'Ronto Wrap' },
  
  // Animal Kingdom
  'Satu\'li Canteen': { type: 'quick-service', priceLevel: 2, tip: 'MELHOR quick-service da Disney! Bowls customizáveis em Pandora', mustTry: 'Bowl com Chimichurri' },
  'Tusker House': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Buffet africano com Mickey Safari! Ótimo para café da manhã', mustTry: 'Buffet completo com pratos africanos' },
  'Yak & Yeti': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Culinária asiática em ambiente himalaia. Tem quick-service também', mustTry: 'Ahi Tuna Nachos' },
  'Flame Tree Barbecue': { type: 'quick-service', priceLevel: 2, tip: 'Melhor churrasco dos parques! Área externa com vista do rio', mustTry: 'Ribs com todos os sides' },
  'Rainforest Cafe': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Animais animatrônicos e "tempestades"! Crianças amam', mustTry: 'Volcano dessert (para compartilhar)' },
  'Pizzafari': { type: 'quick-service', priceLevel: 2, tip: 'Decoração colorida de animais. Bom para comer rápido', mustTry: 'Pizzas flatbread' },
  
  // Universal Studios
  'Moe\'s Tavern': { type: 'quick-service', priceLevel: 2, tip: 'Bar dos Simpsons! Réplica perfeita do desenho', mustTry: 'Flaming Moe (não-alcoólico, borbulha!)' },
  'Leaky Cauldron': { type: 'quick-service', priceLevel: 2, tip: 'Beco Diagonal! Café da manhã inglês autêntico', mustTry: 'Fish and Chips + Butterbeer gelada' },
  'Finnegan\'s Bar & Grill': { type: 'table-service', priceLevel: 2, reservation: true, tip: 'Pub irlandês com música ao vivo! Ar-condicionado forte', mustTry: 'Scotch Eggs' },
  'Lombard\'s Seafood Grille': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Restaurante mais sofisticado do Universal Studios', mustTry: 'Frutos do mar frescos' },
  'Fast Food Boulevard': { type: 'quick-service', priceLevel: 2, tip: 'Praça de alimentação dos Simpsons! Krusty Burger, Lisa\'s Teahouse', mustTry: 'Krusty Burger com Buzz Cola' },
  'Richter\'s Burger Co.': { type: 'quick-service', priceLevel: 2, tip: 'Hambúrgueres em São Francisco. Bom espaço interno', mustTry: 'Chili Cheese Fries' },
  
  // Islands of Adventure
  'Three Broomsticks': { type: 'quick-service', priceLevel: 2, tip: 'Hogsmeade! Café da manhã inglês completo de manhã', mustTry: 'Shepherd\'s Pie + Butterbeer frozen' },
  'Mythos Restaurant': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Eleito MELHOR restaurante de parque temático! Decoração de caverna', mustTry: 'Pad Thai ou Risotto' },
  'Confisco Grille': { type: 'table-service', priceLevel: 2, reservation: true, tip: 'Menu variado internacional. Bom para grupos com gostos diferentes', mustTry: 'Fajitas sizzling' },
  'Thunder Falls Terrace': { type: 'quick-service', priceLevel: 2, tip: 'Vista da splash do Jurassic World! Rotisserie chicken', mustTry: 'Chicken com molho' },
  'The Burger Digs': { type: 'quick-service', priceLevel: 2, tip: 'Jurassic Park! Temático de dinossauros', mustTry: 'Bacon Cheeseburger' },
  'Circus McGurkus Cafe': { type: 'quick-service', priceLevel: 1, tip: 'Seuss Landing! Ótimo para crianças. Pizza e chicken fingers', mustTry: 'Green Eggs and Ham!' },
  
  // Epic Universe
  'Restaurante Principal': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Restaurante principal do Epic Universe', mustTry: 'Menu do dia' },
  'Cafe Paris': { type: 'quick-service', priceLevel: 2, tip: 'Ambiente parisiense no Epic Universe', mustTry: 'Croissants e café' },
  'Toothsome Chocolate Factory': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Steampunk chocolate! Mega milkshakes instagramáveis', mustTry: 'Milkshake com bolo inteiro em cima' },
  'Wizarding World Restaurant': { type: 'table-service', priceLevel: 3, reservation: true, tip: 'Nova área de Harry Potter no Epic Universe', mustTry: 'Pratos temáticos mágicos' },
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'quick-service': return { label: 'Quick Service', color: 'bg-green-500' };
    case 'table-service': return { label: 'Mesa', color: 'bg-blue-500' };
    case 'signature': return { label: 'Signature', color: 'bg-purple-500' };
    default: return { label: 'Restaurante', color: 'bg-gray-500' };
  }
};

const getPriceIndicator = (level: number) => {
  return Array(level).fill('$').join('');
};

const Restaurants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('all');

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, category_id, latitude, longitude, menu_url')
        .eq('type', 'poi')
        .eq('icon', 'restaurant')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      
      // Add park name to each restaurant
      return (data || []).map(r => {
        const park = PARKS.find(p => p.id === r.category_id);
        return { ...r, park_name: park?.name || 'Unknown' };
      });
    },
  });

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPark = selectedPark === 'all' || r.category_id === selectedPark;
      return matchesSearch && matchesPark;
    });
  }, [restaurants, searchTerm, selectedPark]);

  const groupedByPark = useMemo(() => {
    const groups: Record<string, Restaurant[]> = {};
    PARKS.forEach(park => {
      const parkRestaurants = filteredRestaurants.filter(r => r.category_id === park.id);
      if (parkRestaurants.length > 0) {
        groups[park.id] = parkRestaurants;
      }
    });
    return groups;
  }, [filteredRestaurants]);

  const navigateToRestaurant = (restaurant: Restaurant) => {
    if (restaurant.latitude && restaurant.longitude) {
      // Navigate to map with destination
      navigate(`/mapa?destLat=${restaurant.latitude}&destLng=${restaurant.longitude}&destName=${encodeURIComponent(restaurant.title)}`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Restaurantes</h1>
            <p className="text-muted-foreground">Guia completo de onde comer nos parques</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar restaurante..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedPark === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setSelectedPark('all')}
          >
            Todos ({restaurants.length})
          </Badge>
          {PARKS.map(park => {
            const count = restaurants.filter(r => r.category_id === park.id).length;
            if (count === 0) return null;
            return (
              <Badge
                key={park.id}
                variant={selectedPark === park.id ? 'default' : 'secondary'}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setSelectedPark(selectedPark === park.id ? 'all' : park.id)}
              >
                {park.emoji} {park.name} ({count})
              </Badge>
            );
          })}
        </div>

        {/* Restaurant List by Park */}
        <div className="space-y-6">
          {Object.entries(groupedByPark).map(([parkId, parkRestaurants]) => {
            const park = PARKS.find(p => p.id === parkId);
            if (!park) return null;

            return (
              <div key={parkId} className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">{park.emoji}</span>
                  {park.name}
                  <Badge variant="outline" className="ml-2">{parkRestaurants.length}</Badge>
                </h2>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {parkRestaurants.map(restaurant => {
                    const details = RESTAURANT_DETAILS[restaurant.title];
                    const typeInfo = details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
                    const hasCoords = restaurant.latitude && restaurant.longitude;

                    return (
                      <Card 
                        key={restaurant.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base truncate">{restaurant.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${typeInfo.color} text-white text-xs`}>
                                  {typeInfo.label}
                                </Badge>
                                {details && (
                                  <span className="text-sm text-green-600 font-medium">
                                    {getPriceIndicator(details.priceLevel)}
                                  </span>
                                )}
                                {details?.reservation && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Reserva
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {restaurant.menu_url && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-orange-500 hover:bg-orange-500/10"
                                  onClick={() => window.open(restaurant.menu_url!, '_blank')}
                                  title="Ver menu virtual"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                              {hasCoords && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-primary hover:bg-primary/10"
                                  onClick={() => navigateToRestaurant(restaurant)}
                                  title="Navegar até o restaurante"
                                >
                                  <Navigation className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {details?.tip && (
                            <p className="text-sm text-muted-foreground flex items-start gap-1">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
                              {details.tip}
                            </p>
                          )}

                          {details?.mustTry && (
                            <p className="text-sm font-medium text-primary">
                              🍽️ Experimente: {details.mustTry}
                            </p>
                          )}

                          {!hasCoords && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Localização pendente
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;
