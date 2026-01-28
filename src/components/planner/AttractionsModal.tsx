import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Star, Play, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attraction {
  name: string;
  description: string;
  type: 'ride' | 'show' | 'character' | 'experience';
  thrillLevel?: number;
  mustDo?: boolean;
}

interface ParkData {
  id: string;
  name: string;
  color: string;
  attractions: Attraction[];
}

// Park attractions data
const parksData: ParkData[] = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    color: 'from-blue-500 to-purple-500',
    attractions: [
      { name: 'Space Mountain', description: 'Montanha-russa no escuro pelo espaço', type: 'ride', thrillLevel: 3 },
      { name: 'Big Thunder Mountain Railroad', description: 'Montanha-russa em trem pela mina do velho oeste', type: 'ride', thrillLevel: 2 },
      { name: "Tiana's Bayou Adventure", description: 'Passeio aquático com queda de 15 metros', type: 'ride', thrillLevel: 2 },
      { name: 'Pirates of the Caribbean', description: 'Navegue com Jack Sparrow em cenários incríveis', type: 'ride', thrillLevel: 1 },
      { name: 'Haunted Mansion', description: 'Tour assombrado com 999 fantasmas', type: 'ride', thrillLevel: 1 },
      { name: 'Seven Dwarfs Mine Train', description: 'Montanha-russa familiar com os sete anões', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: "Peter Pan's Flight", description: 'Voe sobre Londres até a Terra do Nunca', type: 'ride', thrillLevel: 1 },
      { name: 'Jungle Cruise', description: 'Expedição pela selva com piadas do capitão', type: 'ride', thrillLevel: 1 },
      { name: 'TRON Lightcycle / Run', description: 'Montanha-russa de alta velocidade estilo moto', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: "Buzz Lightyear's Space Ranger Spin", description: 'Atire em alvos para salvar a galáxia', type: 'ride', thrillLevel: 1 },
      { name: 'The Many Adventures of Winnie the Pooh', description: 'Passeio encantador pelo Bosque dos Cem Acres', type: 'ride', thrillLevel: 1 },
      { name: "it's a small world", description: 'Passeio de barco com bonecos do mundo todo', type: 'ride', thrillLevel: 1 },
      { name: "Mickey's PhilharMagic", description: 'Show 4D com Donald e músicas clássicas Disney', type: 'show', thrillLevel: 1 },
      { name: 'Festival of Fantasy Parade', description: 'Desfile mágico com carros alegóricos e personagens', type: 'show' },
      { name: 'Happily Ever After (Fireworks)', description: 'Show de fogos no Castelo da Cinderela', type: 'show', mustDo: true },
    ]
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    color: 'from-teal-500 to-cyan-500',
    attractions: [
      { name: 'Guardians of the Galaxy: Cosmic Rewind', description: 'Montanha-russa indoor com música dos anos 80', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Test Track', description: 'Projete seu carro e teste em alta velocidade', type: 'ride', thrillLevel: 3 },
      { name: 'Frozen Ever After', description: 'Passeio de barco pelo reino de Arendelle', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: "Remy's Ratatouille Adventure", description: 'Aventura 4D do tamanho de um rato pela cozinha', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: "Soarin' Around the World", description: 'Voe sobre paisagens icônicas do mundo', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Spaceship Earth', description: 'Viagem pela história da comunicação humana', type: 'ride', thrillLevel: 1 },
      { name: 'Journey into Imagination with Figment', description: 'Explore a imaginação com Figment', type: 'ride', thrillLevel: 1 },
      { name: 'Living with the Land', description: 'Passeio pelas estufas e agricultura futurista', type: 'ride', thrillLevel: 1 },
      { name: 'The Seas with Nemo & Friends', description: 'Encontre Nemo em aquário gigante', type: 'ride', thrillLevel: 1 },
      { name: 'Mission: SPACE (Orange & Green)', description: 'Simulador de lançamento espacial intenso', type: 'ride', thrillLevel: 4 },
    ]
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    color: 'from-red-500 to-pink-500',
    attractions: [
      { name: 'Star Wars: Rise of the Resistance', description: 'Missão épica contra a Primeira Ordem', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Millennium Falcon: Smugglers Run', description: 'Pilote a Millennium Falcon em missão', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Twilight Zone Tower of Terror', description: 'Elevador mal-assombrado com quedas livres', type: 'ride', thrillLevel: 4 },
      { name: "Rock 'n' Roller Coaster Starring Aerosmith", description: 'Montanha-russa do Aerosmith com looping', type: 'ride', thrillLevel: 4 },
      { name: 'Slinky Dog Dash', description: 'Montanha-russa familiar do Toy Story', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: "Mickey & Minnie's Runaway Railway", description: 'Aventura maluca em desenho animado', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Toy Story Mania!', description: 'Jogo interativo 4D com personagens Toy Story', type: 'ride', thrillLevel: 1 },
      { name: 'Alien Swirling Saucers', description: 'Gire em discos voadores com os aliens', type: 'ride', thrillLevel: 1 },
      { name: 'Star Tours: The Adventures Continue', description: 'Simulador de voo pelo universo Star Wars', type: 'ride', thrillLevel: 2 },
    ]
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    color: 'from-green-500 to-emerald-500',
    attractions: [
      { name: 'Avatar Flight of Passage', description: 'Voe em um banshee por Pandora - sensacional!', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: "Na'vi River Journey", description: 'Passeio de barco pela floresta bioluminescente', type: 'ride', thrillLevel: 1 },
      { name: 'Expedition Everest - Legend of the Forbidden Mountain', description: 'Montanha-russa enfrentando o Yeti', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Kilimanjaro Safaris', description: 'Safari real com animais africanos', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Kali River Rapids', description: 'Rafting por corredeiras - você vai se molhar!', type: 'ride', thrillLevel: 2 },
      { name: 'DINOSAUR', description: 'Viagem no tempo para salvar um dinossauro', type: 'ride', thrillLevel: 3 },
      { name: 'Festival of the Lion King', description: 'Musical do Rei Leão emocionante', type: 'show', mustDo: true },
    ]
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    color: 'from-yellow-500 to-orange-500',
    attractions: [
      { name: 'Harry Potter and the Escape from Gringotts', description: 'Fuja do banco dos bruxos em montanha-russa 3D', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: "Hagrid's Magical Creatures Motorbike Adventure", description: 'Montanha-russa de moto pela Floresta Proibida', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Revenge of the Mummy', description: 'Montanha-russa indoor no escuro com múmias', type: 'ride', thrillLevel: 4 },
      { name: 'Hollywood Rip Ride Rockit', description: 'Montanha-russa vertical - escolha sua música', type: 'ride', thrillLevel: 5 },
      { name: 'TRANSFORMERS: The Ride-3D', description: 'Batalha épica com Autobots em 3D', type: 'ride', thrillLevel: 3 },
      { name: 'MEN IN BLACK Alien Attack', description: 'Atire em aliens pela cidade de NY', type: 'ride', thrillLevel: 2 },
      { name: 'E.T. Adventure', description: 'Voe de bicicleta com E.T. para seu planeta', type: 'ride', thrillLevel: 1 },
      { name: 'Hogwarts Express (King\'s Cross Station)', description: 'Trem entre os dois parques Universal', type: 'ride', thrillLevel: 1, mustDo: true },
    ]
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    color: 'from-indigo-500 to-violet-500',
    attractions: [
      { name: "Hagrid's Magical Creatures Motorbike Adventure", description: 'Montanha-russa de moto pela Floresta Proibida', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Harry Potter and the Forbidden Journey', description: 'Voe por Hogwarts em aventura 3D', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Jurassic World VelociCoaster', description: 'Montanha-russa mais intensa da Flórida', type: 'ride', thrillLevel: 5, mustDo: true },
      { name: 'The Incredible Hulk Coaster', description: 'Montanha-russa com lançamento de 0-60km em 2s', type: 'ride', thrillLevel: 5 },
      { name: 'The Amazing Adventures of Spider-Man', description: 'Aventura 3D clássica com Homem-Aranha', type: 'ride', thrillLevel: 3 },
      { name: 'Jurassic Park River Adventure', description: 'Passeio aquático com queda de 26 metros', type: 'ride', thrillLevel: 3 },
      { name: 'Hogwarts Express (Hogsmeade Station)', description: 'Trem para King\'s Cross Station', type: 'ride', thrillLevel: 1, mustDo: true },
    ]
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    color: 'from-purple-500 to-pink-500',
    attractions: [
      { name: 'Stardust Racers', description: 'Montanha-russa dupla de corrida', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Harry Potter and the Battle at the Ministry', description: 'Aventura no Ministério da Magia', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: "Mario Kart: Bowser's Challenge", description: 'Corrida com Mario em realidade aumentada', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Mine-Cart Madness', description: 'Montanha-russa do carrinho de mina', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: "Yoshi's Adventure", description: 'Passeio tranquilo pelo mundo do Yoshi', type: 'ride', thrillLevel: 1 },
      { name: "Hiccup's Wingless Fly", description: 'Voe com dragões sobre a vila', type: 'ride', thrillLevel: 2 },
      { name: "Dragon Racer's Rally", description: 'Montanha-russa de dragões', type: 'ride', thrillLevel: 3 },
      { name: 'Monsters Unchained: The Wolf Man Experiment', description: 'Aventura com monstros clássicos Universal', type: 'ride', thrillLevel: 3 },
      { name: 'Curse of the Werewolf', description: 'Montanha-russa dos lobisomens', type: 'ride', thrillLevel: 4 },
    ]
  },
];

// Map park names to park IDs
const parkNameToId: Record<string, string> = {
  'Magic Kingdom': 'magic-kingdom',
  'EPCOT': 'epcot',
  'Epcot': 'epcot',
  'Hollywood Studios': 'hollywood-studios',
  'Animal Kingdom': 'animal-kingdom',
  'Universal Studios': 'universal-studios',
  'Islands of Adventure': 'islands-of-adventure',
  'Epic Universe': 'epic-universe',
};

interface AttractionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkName: string;
}

export const AttractionsModal = ({ open, onOpenChange, parkName }: AttractionsModalProps) => {
  const { user } = useAuth();
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Find the park data
  const parkId = parkNameToId[parkName] || parkName.toLowerCase().replace(/\s+/g, '-');
  const park = parksData.find(p => p.id === parkId);

  // Load user preferences when modal opens
  useEffect(() => {
    if (open && user && park) {
      loadPreferences();
    }
  }, [open, user, park]);

  const loadPreferences = async () => {
    if (!user || !park) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from('attraction_preferences')
        .select('attraction_name')
        .eq('user_id', user.id)
        .eq('park_name', park.name);

      if (data) {
        setSelectedAttractions(new Set(data.map(p => p.attraction_name)));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttraction = async (attractionName: string) => {
    if (!user || !park) return;

    const isSelected = selectedAttractions.has(attractionName);
    setSaving(true);

    try {
      if (isSelected) {
        // Remove from preferences
        await supabase
          .from('attraction_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('park_name', park.name)
          .eq('attraction_name', attractionName);

        setSelectedAttractions(prev => {
          const next = new Set(prev);
          next.delete(attractionName);
          return next;
        });
      } else {
        // Add to preferences
        await supabase
          .from('attraction_preferences')
          .insert({
            user_id: user.id,
            park_name: park.name,
            attraction_name: attractionName,
            priority: 1,
          });

        setSelectedAttractions(prev => new Set([...prev, attractionName]));
      }
    } catch (error) {
      console.error('Error toggling attraction:', error);
      toast.error('Erro ao salvar preferência');
    } finally {
      setSaving(false);
    }
  };

  const getThrillBadge = (level?: number) => {
    if (!level) return null;
    const labels = ['', 'Leve', 'Moderado', 'Intenso', 'Muito Intenso', 'Radical'];
    const colors = ['', 'bg-green-500/20 text-green-400', 'bg-yellow-500/20 text-yellow-400', 'bg-orange-500/20 text-orange-400', 'bg-red-500/20 text-red-400', 'bg-purple-500/20 text-purple-400'];
    return (
      <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', colors[level])}>
        {labels[level]}
      </Badge>
    );
  };

  if (!park) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Parque não encontrado</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Não foi possível encontrar as atrações para "{parkName}".
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className={cn("p-4 bg-gradient-to-r text-white rounded-t-lg", park.color)}>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">🎢</span>
            Atrações Desejadas - {park.name}
          </DialogTitle>
          <p className="text-sm text-white/80">
            Selecione as atrações que você quer fazer neste parque
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {selectedAttractions.size} de {park.attractions.length} atrações selecionadas
          </span>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {park.attractions.map((attraction) => {
                const isSelected = selectedAttractions.has(attraction.name);
                return (
                  <Card
                    key={attraction.name}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => toggleAttraction(attraction.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5"
                          onCheckedChange={() => toggleAttraction(attraction.name)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{attraction.name}</span>
                            {attraction.mustDo && (
                              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Imperdível
                              </Badge>
                            )}
                            {getThrillBadge(attraction.thrillLevel)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {attraction.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {attraction.type === 'ride' ? '⚡ Atração' : attraction.type === 'show' ? '🎭 Show' : '✨ Experiência'}
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Concluir Seleção ({selectedAttractions.size} atrações)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttractionsModal;
