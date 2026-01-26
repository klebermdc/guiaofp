import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, ExternalLink, Star, Clock, UtensilsCrossed } from 'lucide-react';

interface POI {
  id: string;
  type: 'restaurant' | 'restroom' | 'shop' | 'firstaid' | 'show';
  name: string;
  position: { lat: number; lng: number };
  schedule?: string | null;
  description?: string | null;
  menuUrl?: string | null;
  cuisineType?: string | null;
  requiresReservation?: boolean | null;
  hasWarning?: boolean | null;
  warningText?: string | null;
}

// Restaurant details with tips (same as Restaurants page)
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

interface RestaurantSidebarCardProps {
  poi: POI;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onOpenMenu?: (url: string, name: string) => void;
}

export function RestaurantSidebarCard({ 
  poi, 
  isSelected, 
  onSelect, 
  onNavigate,
  onOpenMenu 
}: RestaurantSidebarCardProps) {
  const details = RESTAURANT_DETAILS[poi.name];
  const typeInfo = details ? getTypeLabel(details.type) : getTypeLabel('quick-service');
  const reservation = details?.reservation || poi.requiresReservation;

  return (
    <Card 
      variant="glass"
      className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 ${
        isSelected 
          ? 'border-l-orange-500 bg-orange-500/10 shadow-md' 
          : 'border-l-transparent hover:border-l-orange-500/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header: Name & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{poi.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge className={`${typeInfo.color} text-white text-[10px] px-1.5 h-5`}>
                {typeInfo.label}
              </Badge>
              {details && (
                <span className="text-xs text-green-500 font-bold">
                  {getPriceIndicator(details.priceLevel)}
                </span>
              )}
              {reservation && (
                <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-amber-500/50 text-amber-500 gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  Reserva
                </Badge>
              )}
              {poi.cuisineType && (
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                  {poi.cuisineType}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {poi.menuUrl && onOpenMenu && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-orange-500 hover:bg-orange-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu(poi.menuUrl!, poi.name);
                }}
                title="Ver cardápio"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              title="Navegar até o restaurante"
            >
              <Navigation className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Tip Section */}
        {details?.tip && (
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Star className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
            <span className="line-clamp-2">{details.tip}</span>
          </p>
        )}

        {/* Must Try Section */}
        {details?.mustTry && (
          <p className="text-[11px] font-medium text-primary flex items-start gap-1.5">
            <UtensilsCrossed className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Experimente: {details.mustTry}</span>
          </p>
        )}

        {/* Description fallback if no details */}
        {!details && poi.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {poi.description}
          </p>
        )}

        {/* Warning */}
        {poi.hasWarning && poi.warningText && (
          <Badge variant="destructive" className="text-[10px] w-full justify-start">
            ⚠️ {poi.warningText}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
