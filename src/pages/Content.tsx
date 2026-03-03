import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, Sparkles, Loader2, ArrowLeft, MapPin, Ruler, Flame, Ticket, Heart, Check, 
  Clock, DollarSign, Info, AlertTriangle, Lightbulb, Timer, ChevronRight, ExternalLink,
  Star, Users, Filter, X, Search
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  PARK_INFO, 
  ParkInfo, 
  ParkCategory, 
  getCategories, 
  getParksByCategory,
  getParkById 
} from '@/data/parkInfo';

// Import attraction thumbnails
import stardustRacersImg from '@/assets/attractions/stardust-racers.jpg';
import marioKartImg from '@/assets/attractions/mario-kart.jpg';
import ministryBattleImg from '@/assets/attractions/ministry-battle.jpg';
import revengeMummyImg from '@/assets/attractions/revenge-mummy.jpg';
import etAdventureImg from '@/assets/attractions/et-adventure.jpg';

// Attraction thumbnail mapping
const ATTRACTION_THUMBNAILS: Record<string, string> = {
  'Stardust Racers': stardustRacersImg,
  "Mario Kart: Bowser's Challenge": marioKartImg,
  'Harry Potter and the Battle at the Ministry': ministryBattleImg,
  'Revenge of the Mummy': revengeMummyImg,
  'E.T. Adventure': etAdventureImg,
};

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  icon: string;
  color: string;
  is_published: boolean;
  category_id: string | null;
  attraction_name: string | null;
  attraction_description: string | null;
  min_height: string | null;
  thrill_level: number | null;
  pass_type: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
}

const TIP_ICONS: Record<string, React.ReactNode> = {
  'tempo': <Timer className="h-4 w-4" />,
  'dica': <Lightbulb className="h-4 w-4" />,
  'alerta': <AlertTriangle className="h-4 w-4" />,
  'economia': <DollarSign className="h-4 w-4" />,
};

const TIP_COLORS: Record<string, string> = {
  'tempo': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'dica': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'alerta': 'bg-red-500/10 text-red-600 border-red-500/20',
  'economia': 'bg-green-500/10 text-green-600 border-green-500/20',
};

const Content = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPark, setSelectedPark] = useState<ParkInfo | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cameFromAttractions, setCameFromAttractions] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{ park_name: string; attraction_name: string }[]>([]);
  const [savingPreference, setSavingPreference] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ParkCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'videos'>('info');
  const [avgWaitTimes, setAvgWaitTimes] = useState<Record<string, number>>({});

  const parkCategories = getCategories();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  // Realtime subscription for instant sync across pages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('content_attraction_preferences_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attraction_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadUserPreferences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Normalize name for fuzzy matching (remove ™®, punctuation, lowercase, trim)
  const normalizeName = (name: string) => 
    name.toLowerCase().replace(/[™®©"'`:\/\-–—()!.,]/g, '').replace(/\s+/g, ' ').trim();

  // Find avg wait time for an attraction using fuzzy matching
  const getAvgWaitTime = (attractionName: string): number | null => {
    const normalized = normalizeName(attractionName);
    for (const [key, value] of Object.entries(avgWaitTimes)) {
      const normalizedKey = normalizeName(key);
      if (normalizedKey === normalized || 
          normalizedKey.includes(normalized) || 
          normalized.includes(normalizedKey)) {
        return value;
      }
    }
    return null;
  };

  // Fetch 30-day average wait times for selected park
  useEffect(() => {
    if (!selectedPark) {
      setAvgWaitTimes({});
      return;
    }

    const buildAverages = (
      rows: Array<{ attraction_name: string; avg_wait_time?: number | null; wait_time_minutes?: number | null }>,
      key: 'avg_wait_time' | 'wait_time_minutes'
    ) => {
      const totals: Record<string, { sum: number; count: number }> = {};

      rows.forEach((row) => {
        const value = row[key];
        if (value != null) {
          if (!totals[row.attraction_name]) {
            totals[row.attraction_name] = { sum: 0, count: 0 };
          }
          totals[row.attraction_name].sum += Number(value);
          totals[row.attraction_name].count++;
        }
      });

      const averages: Record<string, number> = {};
      Object.entries(totals).forEach(([name, { sum, count }]) => {
        averages[name] = Math.round(sum / count);
      });

      return averages;
    };

    const fetchAvgWaitTimes = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const parkNameVariants: Record<string, string> = {
        'Universal Studios': 'Universal Studios Florida',
        'SeaWorld': 'SeaWorld Orlando',
        'Busch Gardens': 'Busch Gardens Tampa',
      };
      const queryParkName = parkNameVariants[selectedPark.name] || selectedPark.name;

      const [{ data: dailyData, error: dailyError }, { data: recordsData, error: recordsError }] = await Promise.all([
        supabase
          .from('daily_analytics')
          .select('attraction_name, avg_wait_time')
          .eq('park_name', queryParkName)
          .gte('date', startDate),
        supabase
          .from('wait_time_records')
          .select('attraction_name, wait_time_minutes')
          .eq('park_name', queryParkName)
          .gte('date', startDate)
          .not('wait_time_minutes', 'is', null),
      ]);

      if (dailyError) {
        console.error('Error fetching daily analytics wait times:', dailyError);
      }
      if (recordsError) {
        console.error('Error fetching wait time records:', recordsError);
      }

      const fromDaily = dailyData?.length ? buildAverages(dailyData, 'avg_wait_time') : {};
      const fromRecords = recordsData?.length ? buildAverages(recordsData, 'wait_time_minutes') : {};

      // Prefer daily_analytics when available, fallback to raw records for missing attractions
      setAvgWaitTimes({ ...fromRecords, ...fromDaily });
    };

    fetchAvgWaitTimes();
  }, [selectedPark]);

  // Auto-open video from URL parameter
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId && contents.length > 0 && !isLoading) {
      const content = contents.find(c => c.id === videoId);
      if (content) {
        setSelectedContent(content);
        setIsDialogOpen(true);
        setCameFromAttractions(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, contents, isLoading]);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('attraction_preferences')
      .select('park_name, attraction_name')
      .eq('user_id', user.id);
    
    if (data) {
      setUserPreferences(data);
    }
  };

  const getAttractionName = (content: ContentItem) => {
    return content.attraction_name || content.title;
  };

  const isAttractionInPreferences = (attractionName: string) => {
    return userPreferences.some(p => p.attraction_name === attractionName);
  };

  const categoryToParkMap: Record<string, string> = {
    'Magic Kingdom': 'Magic Kingdom',
    'EPCOT': 'EPCOT',
    'Epcot': 'EPCOT',
    'Hollywood Studios': 'Hollywood Studios',
    'Animal Kingdom': 'Animal Kingdom',
    'Universal Studios': 'Universal Studios',
    'Islands of Adventure': 'Islands of Adventure',
    'Island of Adventure': 'Islands of Adventure',
    'Epic Universe': 'Epic Universe',
    'SeaWorld': 'SeaWorld Orlando',
    'Busch Gardens': 'Busch Gardens Tampa',
    'LEGOLAND': 'LEGOLAND Florida',
    'Aquatica': 'Aquatica Orlando',
    'Discovery Cove': 'Discovery Cove',
    'Blizzard Beach': "Disney's Blizzard Beach",
    'Typhoon Lagoon': "Disney's Typhoon Lagoon",
    'Volcano Bay': "Universal's Volcano Bay",
  };

  const getParkNameForAttraction = (content: ContentItem) => {
    const category = categories.find(c => c.id === content.category_id);
    if (category) {
      return categoryToParkMap[category.name] || category.name;
    }
    return 'Desconhecido';
  };

  const toggleAttractionPreference = async (content: ContentItem) => {
    if (!user) return;
    
    setSavingPreference(true);
    const parkName = getParkNameForAttraction(content);
    const attractionName = getAttractionName(content);
    
    try {
      if (isAttractionInPreferences(attractionName)) {
        await supabase
          .from('attraction_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('attraction_name', attractionName);
        
        setUserPreferences(prev => prev.filter(p => p.attraction_name !== attractionName));
        toast.success('Atração removida das desejadas');
      } else {
        await supabase
          .from('attraction_preferences')
          .insert({
            user_id: user.id,
            park_name: parkName,
            attraction_name: attractionName,
            priority: 1
          });
        
        setUserPreferences(prev => [...prev, { park_name: parkName, attraction_name: attractionName }]);
        toast.success('Atração adicionada às desejadas');
      }
    } catch (error) {
      console.error('Error toggling preference:', error);
      toast.error('Erro ao atualizar preferência');
    } finally {
      setSavingPreference(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleBackToAttractions = () => {
    navigate('/atracoes');
  };

  const fetchData = async () => {
    const [contentsRes, categoriesRes] = await Promise.all([
      supabase
        .from('content_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('content_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (!contentsRes.error && contentsRes.data) {
      setContents(contentsRes.data);
    }
    if (!categoriesRes.error && categoriesRes.data) {
      setCategories(categoriesRes.data);
    }
    setIsLoading(false);
  };

  const handleOpenContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsDialogOpen(true);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  // Get contents for selected park based on category name matching
  const getParkContents = () => {
    if (!selectedPark) return [];
    
    const parkCategory = categories.find(cat => 
      cat.name.toLowerCase().includes(selectedPark.name.toLowerCase()) ||
      selectedPark.name.toLowerCase().includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(selectedPark.shortName.toLowerCase())
    );
    
    if (parkCategory) {
      return contents.filter(c => 
        c.category_id === parkCategory.id && 
        c.type === 'video'
      );
    }
    
    return [];
  };

  // Filter parks by category and search
  const HIDDEN_PARK_IDS = ['legoland', 'aquatica', 'discovery-cove', 'blizzard-beach', 'typhoon-lagoon', 'volcano-bay'];

  const filteredParks = useMemo(() => {
    let parks = activeCategory === 'all' 
      ? PARK_INFO 
      : getParksByCategory(activeCategory);
    
    parks = parks.filter(park => !HIDDEN_PARK_IDS.includes(park.id));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      parks = parks.filter(park => 
        park.name.toLowerCase().includes(query) ||
        park.description.toLowerCase().includes(query) ||
        park.categoryLabel.toLowerCase().includes(query)
      );
    }
    
    return parks;
  }, [activeCategory, searchQuery]);

  const handleParkSelect = (park: ParkInfo) => {
    setSelectedPark(park);
    setActiveTab('info');
  };

  const renderThrillLevel = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((l) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full ${
              l <= level
                ? l <= 2
                  ? 'bg-green-500'
                  : l <= 3
                  ? 'bg-yellow-500'
                  : l <= 4
                  ? 'bg-orange-500'
                  : 'bg-red-500'
                : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-gold p-6 sm:p-8 text-secondary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Exclusivo para membros</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              🎢 Guia Completo dos Parques
            </h1>
            <p className="text-secondary-foreground/80">
              Informações, dicas e vídeos de todos os parques de Orlando
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedPark ? (
          // Parks Grid with Categories
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar parques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setActiveCategory('all')}
              >
                Todos ({PARK_INFO.filter(p => !HIDDEN_PARK_IDS.includes(p.id)).length})
              </Badge>
              {parkCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label} ({cat.count})
                </Badge>
              ))}
            </div>

            {/* Parks Grid */}
            {filteredParks.length === 0 ? (
              <Card className="text-center p-12 border-dashed border-2">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Nenhum parque encontrado
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Tente ajustar sua busca ou filtro.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                >
                  Limpar filtros
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredParks.map((park) => (
                  <Card 
                    key={park.id}
                    className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleParkSelect(park)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={park.image} 
                        alt={park.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Dark gradient overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge className="text-xs bg-white text-gray-900 font-semibold shadow-md border-0">
                          {park.categoryLabel}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-3">
                        <h3 className="font-display text-sm sm:text-base font-bold text-white line-clamp-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' }}>
                          {park.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Park Detail View
          <div className="space-y-6">
            {/* Back Button and Park Header */}
            <div className="flex items-start gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPark(null)}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedPark.color} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0`}>
                  {selectedPark.emoji}
                </div>
                <div className="min-w-0">
                  <Badge variant="secondary" className="text-xs mb-1">
                    {selectedPark.categoryLabel}
                  </Badge>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                    {selectedPark.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Tabs: Info vs Videos */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'videos')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="info" className="gap-2">
                  <Info className="h-4 w-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  <Play className="h-4 w-4" />
                  Vídeos ({getParkContents().length})
                </TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-6 mt-6">
                {/* Park Hero Card */}
                <Card className="overflow-hidden">
                  <div className="relative h-48 sm:h-64">
                    <img 
                      src={selectedPark.image} 
                      alt={selectedPark.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${selectedPark.color} opacity-40`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                        {selectedPark.fullDescription}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Horário</span>
                    </div>
                    <p className="text-sm font-medium">{selectedPark.operatingHours}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Timer className="h-4 w-4" />
                      <span className="text-xs">Tempo de Visita</span>
                    </div>
                    <p className="text-sm font-medium">{selectedPark.averageVisitTime}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Estacionamento</span>
                    </div>
                    <p className="text-sm font-medium">{selectedPark.parkingCost}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                      <span className="text-xs">Melhor Dia</span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2">{selectedPark.bestTimeToVisit}</p>
                  </Card>
                </div>

                {/* Highlights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      Destaques do Parque
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPark.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tips Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Dicas do Parque
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedPark.tips.map((tip, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-xl border ${TIP_COLORS[tip.type]}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{tip.icon}</span>
                            <span className="font-semibold text-sm">{tip.title}</span>
                            {TIP_ICONS[tip.type]}
                          </div>
                          <p className="text-sm opacity-90">{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Attractions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Atrações Imperdíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPark.topAttractions.map((attraction, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{attraction.name}</span>
                              {attraction.mustDo && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                  Must-Do
                                </Badge>
                              )}
                              {attraction.lightningLane && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  ⚡ LL
                                </Badge>
                              )}
                            </div>
                            {attraction.tip && (
                              <p className="text-xs text-muted-foreground mt-0.5">{attraction.tip}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {(() => {
                              const waitTime = getAvgWaitTime(attraction.name);
                              return waitTime != null ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className={`font-medium ${
                                    waitTime > 60 ? 'text-red-500' : 
                                    waitTime > 30 ? 'text-yellow-500' : 
                                    'text-green-500'
                                  }`}>
                                    {waitTime} min
                                  </span>
                                </div>
                              ) : null;
                            })()}
                            {attraction.heightRequired && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Ruler className="h-3 w-3" />
                                {attraction.heightRequired}
                              </div>
                            )}
                            {renderThrillLevel(attraction.thrillLevel)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Areas */}
                {selectedPark.areas && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Áreas do Parque
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedPark.areas.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dining Tips */}
                {selectedPark.diningTips && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        🍽️ Onde Comer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedPark.diningTips.map((tip, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                            {tip}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Website Link */}
                <Card className="p-4">
                  <a 
                    href={selectedPark.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors"
                  >
                    <span className="font-medium">Site Oficial</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Card>
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos" className="space-y-4 mt-6">
                {getParkContents().length === 0 ? (
                  <Card className="text-center p-12 border-dashed border-2">
                    <Sparkles className="w-12 h-12 mx-auto text-accent mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      Vídeos em breve!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Estamos preparando vídeos incríveis das atrações deste parque para você.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('info')}
                    >
                      Ver informações do parque
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getParkContents().map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                        onClick={() => handleOpenContent(item)}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {(item.thumbnail_url || ATTRACTION_THUMBNAILS[item.title]) ? (
                            <img 
                              src={item.thumbnail_url || ATTRACTION_THUMBNAILS[item.title]} 
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${selectedPark.color} flex items-center justify-center`}>
                              <Play className="h-12 w-12 text-white/80" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                              <Play className="h-8 w-8 text-primary ml-1" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          
                          {(item.attraction_name || item.min_height || item.thrill_level) && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                              {item.attraction_name && (
                                <p className="text-xs font-medium text-primary truncate">
                                  {item.attraction_name}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {item.min_height && (
                                  <div className="flex items-center gap-1">
                                    <Ruler className="h-3 w-3" />
                                    <span>{item.min_height}</span>
                                  </div>
                                )}
                                {item.thrill_level && (
                                  <div className="flex items-center gap-1">
                                    <Flame className="h-3 w-3" />
                                    {renderThrillLevel(item.thrill_level)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {(selectedContent.attraction_name || selectedContent.min_height || selectedContent.thrill_level) && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Ficha Técnica
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedContent.attraction_name && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Nome da Atração</span>
                        <p className="font-medium text-foreground">{selectedContent.attraction_name}</p>
                      </div>
                    )}
                    {selectedContent.min_height && (
                      <div className="flex items-start gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Altura Mínima</span>
                          <p className="font-medium text-foreground">{selectedContent.min_height}</p>
                        </div>
                      </div>
                    )}
                    {selectedContent.pass_type && (
                      <div className="flex items-start gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Passe</span>
                          <p className="font-medium text-foreground">{selectedContent.pass_type}</p>
                        </div>
                      </div>
                    )}
                    {selectedContent.thrill_level && (
                      <div className="flex items-start gap-2">
                        <Flame className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Radicalidade</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {renderThrillLevel(selectedContent.thrill_level)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedContent.attraction_description && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                      {selectedContent.attraction_description}
                    </p>
                  )}
                </div>
              )}

              {selectedContent.description && (
                <p className="text-muted-foreground">{selectedContent.description}</p>
              )}
              
              {selectedContent.file_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  {selectedContent.file_url.includes('youtube') || selectedContent.file_url.includes('youtu.be') ? (
                    <iframe
                      src={getYoutubeEmbedUrl(selectedContent.file_url)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video 
                      src={selectedContent.file_url} 
                      controls 
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}

              {!selectedContent.file_url && (
                <p className="text-center text-muted-foreground py-8">
                  Este conteúdo ainda não possui um vídeo associado.
                </p>
              )}

              <div className="pt-4 border-t space-y-2">
                {user && (
                  <Button
                    variant={isAttractionInPreferences(getAttractionName(selectedContent)) ? "default" : "outline"}
                    onClick={() => toggleAttractionPreference(selectedContent)}
                    disabled={savingPreference}
                    className="w-full"
                  >
                    {savingPreference ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isAttractionInPreferences(getAttractionName(selectedContent)) ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Heart className="w-4 h-4 mr-2" />
                    )}
                    {isAttractionInPreferences(getAttractionName(selectedContent)) 
                      ? 'Atração nas desejadas' 
                      : 'Adicionar às desejadas'}
                  </Button>
                )}
                {cameFromAttractions && (
                  <Button
                    variant="outline"
                    onClick={handleBackToAttractions}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Atrações
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Content;
