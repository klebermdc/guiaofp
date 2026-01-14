import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
  Save,
  Loader2,
  TreePine,
  Waves
} from 'lucide-react';

interface Attraction {
  name: string;
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
      { name: 'Space Mountain', type: 'ride', thrillLevel: 3 },
      { name: 'Big Thunder Mountain Railroad', type: 'ride', thrillLevel: 2 },
      { name: 'Splash Mountain', type: 'ride', thrillLevel: 2 },
      { name: 'Pirates of the Caribbean', type: 'ride', thrillLevel: 1 },
      { name: 'Haunted Mansion', type: 'ride', thrillLevel: 1 },
      { name: 'Seven Dwarfs Mine Train', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Peter Pan\'s Flight', type: 'ride', thrillLevel: 1 },
      { name: 'Jungle Cruise', type: 'ride', thrillLevel: 1 },
      { name: 'TRON Lightcycle Run', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Buzz Lightyear\'s Space Ranger Spin', type: 'ride', thrillLevel: 1 },
      { name: 'The Many Adventures of Winnie the Pooh', type: 'ride', thrillLevel: 1 },
      { name: 'It\'s a Small World', type: 'ride', thrillLevel: 1 },
      { name: 'Mickey\'s PhilharMagic', type: 'show', thrillLevel: 1 },
      { name: 'Festival of Fantasy Parade', type: 'show' },
      { name: 'Happily Ever After (Fireworks)', type: 'show', mustDo: true },
      { name: 'Meet Mickey Mouse', type: 'character' },
      { name: 'Meet Princesses at Princess Fairytale Hall', type: 'character' },
    ]
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    icon: Globe,
    color: 'from-teal-500 to-cyan-500',
    attractions: [
      { name: 'Guardians of the Galaxy: Cosmic Rewind', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Test Track', type: 'ride', thrillLevel: 3 },
      { name: 'Frozen Ever After', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Remy\'s Ratatouille Adventure', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Soarin\' Around the World', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Spaceship Earth', type: 'ride', thrillLevel: 1 },
      { name: 'Journey Into Imagination', type: 'ride', thrillLevel: 1 },
      { name: 'Living with the Land', type: 'ride', thrillLevel: 1 },
      { name: 'The Seas with Nemo & Friends', type: 'ride', thrillLevel: 1 },
      { name: 'Mission: SPACE', type: 'ride', thrillLevel: 4 },
      { name: 'EPCOT Forever (Fireworks)', type: 'show', mustDo: true },
      { name: 'World Showcase Countries', type: 'experience' },
    ]
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    icon: Film,
    color: 'from-red-500 to-pink-500',
    attractions: [
      { name: 'Star Wars: Rise of the Resistance', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Millennium Falcon: Smugglers Run', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Tower of Terror', type: 'ride', thrillLevel: 4 },
      { name: 'Rock \'n\' Roller Coaster', type: 'ride', thrillLevel: 4 },
      { name: 'Slinky Dog Dash', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Mickey & Minnie\'s Runaway Railway', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Toy Story Mania!', type: 'ride', thrillLevel: 1 },
      { name: 'Alien Swirling Saucers', type: 'ride', thrillLevel: 1 },
      { name: 'Star Tours', type: 'ride', thrillLevel: 2 },
      { name: 'Fantasmic!', type: 'show', mustDo: true },
      { name: 'Indiana Jones Epic Stunt Spectacular', type: 'show' },
      { name: 'Meet Kylo Ren', type: 'character' },
      { name: 'Meet Disney Junior Characters', type: 'character' },
    ]
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    icon: TreePine,
    color: 'from-green-500 to-emerald-500',
    attractions: [
      { name: 'Avatar Flight of Passage', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Na\'vi River Journey', type: 'ride', thrillLevel: 1 },
      { name: 'Expedition Everest', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Kilimanjaro Safaris', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Kali River Rapids', type: 'ride', thrillLevel: 2 },
      { name: 'Dinosaur', type: 'ride', thrillLevel: 3 },
      { name: 'TriceraTop Spin', type: 'ride', thrillLevel: 1 },
      { name: 'Festival of the Lion King', type: 'show', mustDo: true },
      { name: 'Finding Nemo: The Big Blue... and Beyond!', type: 'show' },
      { name: 'Tree of Life Awakenings', type: 'show' },
      { name: 'Gorilla Falls Exploration Trail', type: 'experience' },
    ]
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    icon: Rocket,
    color: 'from-yellow-500 to-orange-500',
    attractions: [
      { name: 'Harry Potter and the Escape from Gringotts', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Hagrid\'s Magical Creatures Motorbike Adventure', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Revenge of the Mummy', type: 'ride', thrillLevel: 4 },
      { name: 'Hollywood Rip Ride Rockit', type: 'ride', thrillLevel: 5 },
      { name: 'Transformers: The Ride 3D', type: 'ride', thrillLevel: 3 },
      { name: 'Men in Black: Alien Attack', type: 'ride', thrillLevel: 2 },
      { name: 'E.T. Adventure', type: 'ride', thrillLevel: 1 },
      { name: 'Race Through New York Starring Jimmy Fallon', type: 'ride', thrillLevel: 2 },
      { name: 'Fast & Furious: Supercharged', type: 'ride', thrillLevel: 2 },
      { name: 'Diagon Alley', type: 'experience', mustDo: true },
      { name: 'Hogwarts Express', type: 'ride', thrillLevel: 1, mustDo: true },
    ]
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    icon: Waves,
    color: 'from-indigo-500 to-violet-500',
    attractions: [
      { name: 'Hagrid\'s Magical Creatures Motorbike Adventure', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Harry Potter and the Forbidden Journey', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'VelociCoaster', type: 'ride', thrillLevel: 5, mustDo: true },
      { name: 'The Incredible Hulk Coaster', type: 'ride', thrillLevel: 5 },
      { name: 'The Amazing Adventures of Spider-Man', type: 'ride', thrillLevel: 3 },
      { name: 'Jurassic World VelociCoaster', type: 'ride', thrillLevel: 5 },
      { name: 'Jurassic Park River Adventure', type: 'ride', thrillLevel: 3 },
      { name: 'Skull Island: Reign of Kong', type: 'ride', thrillLevel: 2 },
      { name: 'Doctor Doom\'s Fearfall', type: 'ride', thrillLevel: 4 },
      { name: 'Popeye & Bluto\'s Bilge-Rat Barges', type: 'ride', thrillLevel: 2 },
      { name: 'Hogsmeade Village', type: 'experience', mustDo: true },
    ]
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    attractions: [
      { name: 'Starfall Racers', type: 'ride', thrillLevel: 4, mustDo: true },
      { name: 'Harry Potter and the Battle at the Ministry', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Mario Kart: Bowser\'s Challenge', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Donkey Kong Mine Cart Madness', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'How to Train Your Dragon - Hiccup\'s Wing Gliders', type: 'ride', thrillLevel: 2 },
      { name: 'Monsters Unleashed', type: 'ride', thrillLevel: 3 },
      { name: 'Super Nintendo World', type: 'experience', mustDo: true },
      { name: 'The Wizarding World of Harry Potter - Ministry of Magic', type: 'experience', mustDo: true },
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
  const { user } = useAuth();
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

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

  const toggleAttraction = (parkName: string, attractionName: string) => {
    if (isSelected(parkName, attractionName)) {
      setSelectedAttractions(prev => 
        prev.filter(a => !(a.parkName === parkName && a.attractionName === attractionName))
      );
    } else {
      setSelectedAttractions(prev => [
        ...prev,
        { parkName, attractionName, priority: 1, notes: '' }
      ]);
    }
  };

  const updateNote = (parkName: string, attractionName: string, note: string) => {
    const key = `${parkName}-${attractionName}`;
    setNotes(prev => ({ ...prev, [key]: note }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Delete existing preferences
      await supabase
        .from('attraction_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences
      if (selectedAttractions.length > 0) {
        const { error } = await supabase
          .from('attraction_preferences')
          .insert(
            selectedAttractions.map(a => ({
              user_id: user.id,
              park_name: a.parkName,
              attraction_name: a.attractionName,
              priority: a.priority,
              notes: notes[`${a.parkName}-${a.attractionName}`] || null
            }))
          );

        if (error) throw error;
      }

      toast.success('Preferências salvas com sucesso!');
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
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="gradient-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Seleção
          </Button>
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
              <div className="text-xs text-muted-foreground">Must-Do's</div>
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

        {/* Parks Tabs */}
        <Tabs defaultValue="magic-kingdom" className="w-full">
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
                                    Must-Do
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {getTypeLabel(attraction.type)}
                                </Badge>
                                {getThrillBadge(attraction.thrillLevel)}
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

        {/* Floating Save Button (Mobile) */}
        <div className="fixed bottom-4 right-4 sm:hidden z-40">
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            size="lg"
            className="gradient-primary shadow-lg rounded-full h-14 w-14 p-0"
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}