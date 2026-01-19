import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { ItineraryModal } from '@/components/itinerary/ItineraryModal';
import { useGenerateItinerary } from '@/hooks/useGenerateItinerary';
import { 
  Castle, 
  Sparkles, 
  Globe, 
  Film, 
  Rocket,
  Wand2,
  Zap,
  Star,
  Heart,
  Clock,
  Loader2,
  TreePine,
  Waves,
  Route,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Attraction {
  name: string;
  description: string;
  type: 'ride' | 'show' | 'character' | 'experience';
  thrillLevel?: number;
  mustDo?: boolean;
}

interface Park {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  attractions: Attraction[];
}

const parks: Park[] = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    icon: Castle,
    color: 'from-blue-500 to-purple-500',
    attractions: [
      { name: 'Space Mountain', description: 'Montanha-russa no escuro pelo espaço', type: 'ride', thrillLevel: 3 },
      { name: 'Big Thunder Mountain Railroad', description: 'Montanha-russa em trem pela mina do velho oeste', type: 'ride', thrillLevel: 2 },
      { name: 'Splash Mountain', description: 'Passeio aquático com queda de 15 metros', type: 'ride', thrillLevel: 2 },
      { name: 'Pirates of the Caribbean', description: 'Navegue com Jack Sparrow em cenários incríveis', type: 'ride', thrillLevel: 1 },
      { name: 'Haunted Mansion', description: 'Tour assombrado com 999 fantasmas', type: 'ride', thrillLevel: 1 },
      { name: 'Seven Dwarfs Mine Train', description: 'Montanha-russa familiar com os sete anões', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Peter Pan\'s Flight', description: 'Voe sobre Londres até a Terra do Nunca', type: 'ride', thrillLevel: 1 },
      { name: 'Jungle Cruise', description: 'Expedição pela selva com piadas do capitão', type: 'ride', thrillLevel: 1 },
      { name: 'TRON Lightcycle Run', description: 'Montanha-russa de alta velocidade estilo moto', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Buzz Lightyear\'s Space Ranger Spin', description: 'Atire em alvos para salvar a galáxia', type: 'ride', thrillLevel: 1 },
      { name: 'The Many Adventures of Winnie the Pooh', description: 'Passeio encantador pelo Bosque dos Cem Acres', type: 'ride', thrillLevel: 1 },
      { name: 'It\'s a Small World', description: 'Passeio de barco com bonecos do mundo todo', type: 'ride', thrillLevel: 1 },
      { name: 'Mickey\'s PhilharMagic', description: 'Show 4D com Donald e músicas clássicas Disney', type: 'show', thrillLevel: 1 },
      { name: 'Festival of Fantasy Parade', description: 'Desfile mágico com carros alegóricos e personagens', type: 'show' },
      { name: 'Happily Ever After (Fireworks)', description: 'Show de fogos no Castelo da Cinderela', type: 'show', mustDo: true },
      { name: 'Meet Mickey Mouse', description: 'Encontro com o Mickey no Town Square Theater', type: 'character' },
      { name: 'Meet Princesses at Princess Fairytale Hall', description: 'Encontro com princesas no castelo', type: 'character' },
    ]
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    icon: Globe,
    color: 'from-teal-500 to-cyan-500',
    attractions: [
      { name: 'Guardians of the Galaxy: Cosmic Rewind', description: 'Montanha-russa indoor com música dos anos 80', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Test Track', description: 'Projete seu carro e teste em alta velocidade', type: 'ride', thrillLevel: 3 },
      { name: 'Frozen Ever After', description: 'Passeio de barco pelo reino de Arendelle', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Remy\'s Ratatouille Adventure', description: 'Aventura 4D do tamanho de um rato pela cozinha', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Soarin\' Around the World', description: 'Voe sobre paisagens icônicas do mundo', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Spaceship Earth', description: 'Viaje pela história da comunicação humana', type: 'ride', thrillLevel: 1 },
      { name: 'Journey Into Imagination', description: 'Explore a imaginação com Figment', type: 'ride', thrillLevel: 1 },
      { name: 'Living with the Land', description: 'Passeio pelas estufas e agricultura futurista', type: 'ride', thrillLevel: 1 },
      { name: 'The Seas with Nemo & Friends', description: 'Encontre Nemo em aquário gigante', type: 'ride', thrillLevel: 1 },
      { name: 'Mission: SPACE', description: 'Simulador de lançamento espacial intenso', type: 'ride', thrillLevel: 4 },
      { name: 'Luminous (Fireworks)', description: 'Show noturno espetacular na lagoa', type: 'show', mustDo: true },
      { name: 'World Showcase Countries', description: 'Explore 11 pavilhões de países diferentes', type: 'experience' },
    ]
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    icon: Film,
    color: 'from-red-500 to-pink-500',
    attractions: [
      { name: 'Star Wars: Rise of the Resistance', description: 'Missão épica contra a Primeira Ordem', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Millennium Falcon: Smugglers Run', description: 'Pilote a Millennium Falcon em missão', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Tower of Terror', description: 'Elevador mal-assombrado com quedas livres', type: 'ride', thrillLevel: 4 },
      { name: 'Rock \'n\' Roller Coaster', description: 'Montanha-russa do Aerosmith com looping', type: 'ride', thrillLevel: 4 },
      { name: 'Slinky Dog Dash', description: 'Montanha-russa familiar do Toy Story', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Mickey & Minnie\'s Runaway Railway', description: 'Aventura maluca em desenho animado', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Toy Story Mania!', description: 'Jogo interativo 4D com personagens Toy Story', type: 'ride', thrillLevel: 1 },
      { name: 'Alien Swirling Saucers', description: 'Gire em discos voadores com os aliens', type: 'ride', thrillLevel: 1 },
      { name: 'Star Tours', description: 'Simulador de voo pelo universo Star Wars', type: 'ride', thrillLevel: 2 },
      { name: 'Fantasmic!', description: 'Show noturno épico com fogos e água', type: 'show', mustDo: true },
      { name: 'Indiana Jones Epic Stunt Spectacular', description: 'Show ao vivo de cenas de ação', type: 'show' },
      { name: 'Meet Kylo Ren', description: 'Encontro com o vilão da nova trilogia', type: 'character' },
      { name: 'Meet Disney Junior Characters', description: 'Personagens para os pequenos', type: 'character' },
    ]
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    icon: TreePine,
    color: 'from-green-500 to-emerald-500',
    attractions: [
      { name: 'Avatar Flight of Passage', description: 'Voe em um banshee por Pandora - sensacional!', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Na\'vi River Journey', description: 'Passeio de barco pela floresta bioluminescente', type: 'ride', thrillLevel: 1 },
      { name: 'Expedition Everest', description: 'Montanha-russa enfrentando o Yeti', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Kilimanjaro Safaris', description: 'Safari real com animais africanos', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Kali River Rapids', description: 'Rafting por corredeiras - você vai se molhar!', type: 'ride', thrillLevel: 2 },
      { name: 'Dinosaur', description: 'Viagem no tempo para salvar um dinossauro', type: 'ride', thrillLevel: 3 },
      { name: 'TriceraTop Spin', description: 'Atração giratória para crianças', type: 'ride', thrillLevel: 1 },
      { name: 'Festival of the Lion King', description: 'Musical do Rei Leão emocionante', type: 'show', mustDo: true },
      { name: 'Finding Nemo: The Big Blue... and Beyond!', description: 'Musical com marionetes de Nemo', type: 'show' },
      { name: 'Tree of Life Awakenings', description: 'Projeções mágicas na Árvore da Vida', type: 'show' },
      { name: 'Gorilla Falls Exploration Trail', description: 'Trilha para ver gorilas e animais', type: 'experience' },
    ]
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    icon: Rocket,
    color: 'from-yellow-500 to-orange-500',
    attractions: [
      { name: 'Harry Potter and the Escape from Gringotts', description: 'Fuja do banco dos bruxos em montanha-russa 3D', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Hagrid\'s Magical Creatures Motorbike Adventure', description: 'Montanha-russa de moto pela Floresta Proibida', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Revenge of the Mummy', description: 'Montanha-russa indoor no escuro com múmias', type: 'ride', thrillLevel: 4 },
      { name: 'Hollywood Rip Ride Rockit', description: 'Montanha-russa vertical - escolha sua música', type: 'ride', thrillLevel: 5 },
      { name: 'Transformers: The Ride 3D', description: 'Batalha épica com Autobots em 3D', type: 'ride', thrillLevel: 3 },
      { name: 'Men in Black: Alien Attack', description: 'Atire em aliens pela cidade de NY', type: 'ride', thrillLevel: 2 },
      { name: 'E.T. Adventure', description: 'Voe de bicicleta com E.T. para seu planeta', type: 'ride', thrillLevel: 1 },
      { name: 'Race Through New York Starring Jimmy Fallon', description: 'Simulador de corrida por Nova York', type: 'ride', thrillLevel: 2 },
      { name: 'Fast & Furious: Supercharged', description: 'Perseguição de carros em alta velocidade', type: 'ride', thrillLevel: 2 },
      { name: 'Diagon Alley', description: 'Explore a rua dos bruxos com lojas mágicas', type: 'experience', mustDo: true },
      { name: 'Hogwarts Express', description: 'Trem entre os dois parques Universal', type: 'ride', thrillLevel: 1, mustDo: true },
    ]
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    icon: Waves,
    color: 'from-indigo-500 to-violet-500',
    attractions: [
      { name: 'Hagrid\'s Magical Creatures Motorbike Adventure', description: 'Montanha-russa de moto pela Floresta Proibida', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Harry Potter and the Forbidden Journey', description: 'Voe por Hogwarts em aventura 3D', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'VelociCoaster', description: 'Montanha-russa mais intensa da Flórida', type: 'ride', thrillLevel: 5, mustDo: true },
      { name: 'The Incredible Hulk Coaster', description: 'Montanha-russa com lançamento de 0-60km em 2s', type: 'ride', thrillLevel: 5 },
      { name: 'The Amazing Adventures of Spider-Man', description: 'Aventura 3D clássica com Homem-Aranha', type: 'ride', thrillLevel: 3 },
      { name: 'Jurassic World VelociCoaster', description: 'Montanha-russa radical com dinossauros', type: 'ride', thrillLevel: 5 },
      { name: 'Jurassic Park River Adventure', description: 'Passeio aquático com queda de 26 metros', type: 'ride', thrillLevel: 3 },
      { name: 'Skull Island: Reign of Kong', description: 'Expedição 3D enfrentando o King Kong', type: 'ride', thrillLevel: 2 },
      { name: 'Doctor Doom\'s Fearfall', description: 'Torre de queda livre radical', type: 'ride', thrillLevel: 4 },
      { name: 'Popeye & Bluto\'s Bilge-Rat Barges', description: 'Rafting divertido - prepare para molhar!', type: 'ride', thrillLevel: 2 },
      { name: 'Hogsmeade Village', description: 'Vila mágica com cerveja amanteigada', type: 'experience', mustDo: true },
    ]
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    attractions: [
      { name: 'Starfall Racers', description: 'Montanha-russa dupla de corrida', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Harry Potter and the Battle at the Ministry', description: 'Aventura no Ministério da Magia', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Mario Kart: Bowser\'s Challenge', description: 'Corrida com Mario em realidade aumentada', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Donkey Kong Mine Cart Madness', description: 'Montanha-russa do carrinho de mina', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'How to Train Your Dragon - Hiccup\'s Wing Gliders', description: 'Voe com dragões sobre a vila', type: 'ride', thrillLevel: 2 },
      { name: 'Monsters Unleashed', description: 'Aventura com monstros clássicos Universal', type: 'ride', thrillLevel: 3 },
      { name: 'Super Nintendo World', description: 'Área imersiva do mundo dos games', type: 'experience', mustDo: true },
      { name: 'The Wizarding World of Harry Potter - Ministry of Magic', description: 'Nova área temática do Ministério da Magia', type: 'experience', mustDo: true },
    ]
  },
];

interface SelectedAttraction {
  parkName: string;
  attractionName: string;
  priority: number;
  notes: string;
}

export default function Attractions() {
  const { user, travelProfile } = useAuth();
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('magic-kingdom');
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [contentItems, setContentItems] = useState<{ title: string; attraction_name: string | null }[]>([]);
  
  const { generateItinerary, isGenerating, result, error, hasGuide, clearResult } = useGenerateItinerary();

  useEffect(() => {
    loadPreferences();
    loadContentItems();
  }, [user]);

  const loadContentItems = async () => {
    const { data } = await supabase
      .from('content_items')
      .select('title, attraction_name')
      .eq('is_published', true);
    
    if (data) {
      setContentItems(data);
    }
  };

  const hasContentVideo = (attractionName: string) => {
    return contentItems.some(
      item => 
        item.title?.toLowerCase() === attractionName.toLowerCase() ||
        item.attraction_name?.toLowerCase() === attractionName.toLowerCase()
    );
  };

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('attraction_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const selected = data.map(item => ({
          parkName: item.park_name,
          attractionName: item.attraction_name,
          priority: item.priority || 1,
          notes: item.notes || ''
        }));
        setSelectedAttractions(selected);
        
        const notesMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.notes) {
            notesMap[`${item.park_name}-${item.attraction_name}`] = item.notes;
          }
        });
        setNotes(notesMap);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (parkName: string, attractionName: string) => {
    return selectedAttractions.some(
      a => a.parkName === parkName && a.attractionName === attractionName
    );
  };

  const toggleAttraction = async (parkName: string, attractionName: string) => {
    let newSelected: SelectedAttraction[];
    
    if (isSelected(parkName, attractionName)) {
      newSelected = selectedAttractions.filter(a => !(a.parkName === parkName && a.attractionName === attractionName));
    } else {
      newSelected = [
        ...selectedAttractions,
        { parkName, attractionName, priority: 1, notes: '' }
      ];
    }
    
    setSelectedAttractions(newSelected);
    
    // Auto-save to database
    await saveToDatabase(newSelected);
  };

  const updateNote = async (parkName: string, attractionName: string, note: string) => {
    const key = `${parkName}-${attractionName}`;
    const newNotes = { ...notes, [key]: note };
    setNotes(newNotes);
    
    // Debounced save - will save after user stops typing
    await saveToDatabase(selectedAttractions, newNotes);
  };

  const saveToDatabase = async (attractions: SelectedAttraction[], currentNotes?: Record<string, string>) => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Delete existing preferences
      await supabase
        .from('attraction_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences
      if (attractions.length > 0) {
        const notesToUse = currentNotes || notes;
        const { error } = await supabase
          .from('attraction_preferences')
          .insert(
            attractions.map(a => ({
              user_id: user.id,
              park_name: a.parkName,
              attraction_name: a.attractionName,
              priority: a.priority,
              notes: notesToUse[`${a.parkName}-${a.attractionName}`] || null
            }))
          );

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: Attraction['type']) => {
    switch (type) {
      case 'ride': return Zap;
      case 'show': return Star;
      case 'character': return Heart;
      case 'experience': return Sparkles;
      default: return Star;
    }
  };

  const getTypeLabel = (type: Attraction['type']) => {
    switch (type) {
      case 'ride': return 'Atração';
      case 'show': return 'Show';
      case 'character': return 'Personagem';
      case 'experience': return 'Experiência';
      default: return type;
    }
  };

  const getThrillBadge = (level?: number) => {
    if (!level) return null;
    const colors = {
      1: 'bg-green-100 text-green-700',
      2: 'bg-yellow-100 text-yellow-700',
      3: 'bg-orange-100 text-orange-700',
      4: 'bg-red-100 text-red-700',
      5: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      1: 'Leve',
      2: 'Moderado',
      3: 'Intenso',
      4: 'Radical',
      5: 'Extremo',
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || colors[1]}>
        {labels[level as keyof typeof labels] || 'Leve'}
      </Badge>
    );
  };

  const countByPark = (parkId: string) => {
    const park = parks.find(p => p.id === parkId);
    if (!park) return 0;
    return selectedAttractions.filter(a => a.parkName === park.name).length;
  };

  const handleGenerateItinerary = async () => {
    const activePark = parks.find(p => p.id === activeTab);
    if (!activePark) return;

    const parkAttractions = selectedAttractions.filter(a => a.parkName === activePark.name);
    
    if (parkAttractions.length === 0) {
      toast.error('Selecione pelo menos uma atração deste parque');
      return;
    }

    // Encontrar data do parque no perfil, se existir
    const parkDates = travelProfile?.parkDates as Array<{ park: string; date?: string }> | undefined;
    const parkDateEntry = parkDates?.find(pd => pd.park === activePark.name);
    
    setItineraryModalOpen(true);
    await generateItinerary(
      parkAttractions.map(a => ({
        parkName: a.parkName,
        attractionName: a.attractionName,
        notes: notes[`${a.parkName}-${a.attractionName}`],
      })),
      activePark.name,
      parkDateEntry?.date,
      travelProfile?.groupSize
    );
  };

  const handleContactGuide = () => {
    window.open('https://wa.me/5511966144493?text=Olá! Tenho interesse no Guiamento Premium para minha viagem a Orlando.', '_blank');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SavingIndicator isSaving={saving} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Atrações Desejadas
            </h1>
            <p className="text-muted-foreground mt-1">
              Selecione as atrações que você gostaria de fazer em cada parque
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{selectedAttractions.length}</div>
              <div className="text-xs text-muted-foreground">Total Selecionadas</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(selectedAttractions.map(a => a.parkName)).size}
              </div>
              <div className="text-xs text-muted-foreground">Parques</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedAttractions.filter(a => 
                  parks.flatMap(p => p.attractions.filter(att => att.mustDo && att.name === a.attractionName)).length > 0
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Imperdíveis</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(notes).filter(n => n.trim()).length}
              </div>
              <div className="text-xs text-muted-foreground">Com Notas</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Itinerary Button */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Route className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Gerar Roteiro</h3>
                <p className="text-sm text-muted-foreground">
                  {hasGuide 
                    ? 'Crie um roteiro otimizado para o parque selecionado' 
                    : 'Receba dicas gerais para sua visita'}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleGenerateItinerary}
              disabled={isGenerating || selectedAttractions.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Roteiro
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Parks Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-2 rounded-xl">
            {parks.map(park => (
              <TabsTrigger 
                key={park.id} 
                value={park.id}
                className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
              >
                <park.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{park.name}</span>
                <span className="sm:hidden">{park.name.split(' ')[0]}</span>
                {countByPark(park.id) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {countByPark(park.id)}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {parks.map(park => (
            <TabsContent key={park.id} value={park.id} className="mt-4">
              <Card>
                <CardHeader className={`bg-gradient-to-r ${park.color} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center gap-2">
                    <park.icon className="w-6 h-6" />
                    {park.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {park.attractions.map((attraction, idx) => {
                      const selected = isSelected(park.name, attraction.name);
                      const TypeIcon = getTypeIcon(attraction.type);
                      const noteKey = `${park.name}-${attraction.name}`;
                      
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            selected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => toggleAttraction(park.name, attraction.name)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`font-medium ${selected ? 'text-primary' : ''}`}>
                                  {attraction.name}
                                </span>
                                {attraction.mustDo && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Imperdível
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {attraction.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {getTypeLabel(attraction.type)}
                                </Badge>
                                {getThrillBadge(attraction.thrillLevel)}
                                {hasContentVideo(attraction.name) && (
                                  <Link
                                    to="/conteudo"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                  >
                                    <Play className="w-3 h-3" />
                                    Ver vídeo
                                  </Link>
                                )}
                              </div>
                              
                              {selected && (
                                <div className="mt-3">
                                  <Textarea
                                    placeholder="Adicione observações (opcional)..."
                                    value={notes[noteKey] || ''}
                                    onChange={(e) => updateNote(park.name, attraction.name, e.target.value)}
                                    className="text-sm resize-none"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Floating Save Indicator (Mobile) */}
        {saving && (
          <div className="fixed bottom-4 right-4 sm:hidden z-40">
            <div className="gradient-primary shadow-lg rounded-full h-14 w-14 p-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Modal */}
      <ItineraryModal
        open={itineraryModalOpen}
        onOpenChange={(open) => {
          setItineraryModalOpen(open);
          if (!open) clearResult();
        }}
        isGenerating={isGenerating}
        result={result}
        error={error}
        onContactGuide={handleContactGuide}
      />
    </AppLayout>
  );
}