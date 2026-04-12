import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { ItineraryModal } from '@/components/itinerary/ItineraryModal';
import { AttractionNoteField } from '@/components/attractions/AttractionNoteField';
import { useGenerateItinerary } from '@/hooks/useGenerateItinerary';
import { SEO } from '@/components/SEO';
import { useAttractions, type Attraction } from '@/hooks/useAttractions';
import { 
  Sparkles, 
  Zap,
  Star,
  Heart,
  Loader2,
  Route,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SelectedAttraction {
  parkName: string;
  attractionName: string;
  priority: number;
  notes: string;
}

export default function Attractions() {
  const { user, travelProfile } = useAuth();
  const { t } = useLanguage();
  const { parks, isLoading: parksLoading, error: parksError } = useAttractions();
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [contentItems, setContentItems] = useState<{ id: string; title: string; attraction_name: string | null }[]>([]);
  
  const { generateItinerary, isGenerating, result, error, clearResult } = useGenerateItinerary();

  // Set initial active tab when parks load
  useEffect(() => {
    if (parks.length > 0 && !activeTab) {
      setActiveTab(parks[0].id);
    }
  }, [parks, activeTab]);

  useEffect(() => {
    loadPreferences();
    loadContentItems();
  }, [user]);

  // Recarrega quando o usuário volta para a aba/janela (sincroniza com alterações feitas em /conteudos)
  useEffect(() => {
    if (!user) return;

    const onFocus = () => {
      loadPreferences();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user]);

  // Realtime subscription for instant sync across pages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('attraction_preferences_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attraction_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Reload preferences when any change happens
          loadPreferences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadContentItems = async () => {
    const { data } = await supabase
      .from('content_items')
      .select('id, title, attraction_name')
      .eq('is_published', true);
    
    if (data) {
      setContentItems(data);
    }
  };

  // Normaliza string para comparação (remove caracteres especiais, espaços extras, etc.)
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]/g, '') // remove caracteres especiais
      .trim();
  };

  const canonicalizeParkName = (parkName: string) => {
    const map: Record<string, string> = {
      'Epcot': 'EPCOT',
      'EPCOT': 'EPCOT',
      'Island of Adventure': 'Islands of Adventure',
      'Islands of Adventure': 'Islands of Adventure',
    };

    return map[parkName] || parkName;
  };

  const getContentId = (attractionName: string) => {
    const normalizedAttractionName = normalizeString(attractionName);
    const content = contentItems.find(
      item => 
        normalizeString(item.title || '') === normalizedAttractionName ||
        normalizeString(item.attraction_name || '') === normalizedAttractionName
    );
    return content?.id || null;
  };

  const hasContentVideo = (attractionName: string) => {
    return getContentId(attractionName) !== null;
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
        const selected = data.map(item => {
          const parkName = canonicalizeParkName(item.park_name);
          const attractionName = item.attraction_name;

          return {
            parkName,
            attractionName,
            priority: item.priority || 1,
            notes: item.notes || ''
          };
        });
        setSelectedAttractions(selected);
        
        const notesMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.notes) {
            const parkName = canonicalizeParkName(item.park_name);
            notesMap[`${parkName}-${item.attraction_name}`] = item.notes;
          }
        });
        setNotes(notesMap);
      }
    } catch {
      toast.error('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const selectedKeySet = useMemo(() => {
    return new Set(selectedAttractions.map((a) => `${a.parkName}|||${a.attractionName}`));
  }, [selectedAttractions]);

  const isSelected = useCallback(
    (parkName: string, attractionName: string) => {
      return selectedKeySet.has(`${parkName}|||${attractionName}`);
    },
    [selectedKeySet]
  );

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

  const commitNote = useCallback(
    async (parkName: string, attractionName: string, note: string) => {
      const key = `${parkName}-${attractionName}`;
      // Atualiza o estado local apenas no commit (não em cada tecla)
      setNotes((prev) => (prev[key] === note ? prev : { ...prev, [key]: note }));

      if (!user) return;
      setSaving(true);
      try {
        // Upsert garante que o registro exista (evita race quando o usuário começa a digitar logo após selecionar)
        const { error } = await supabase
          .from('attraction_preferences')
          .upsert(
            {
              user_id: user.id,
              park_name: parkName,
              attraction_name: attractionName,
              priority: 1,
              notes: note || null,
            },
            { onConflict: 'user_id,park_name,attraction_name' }
          );

        if (error) throw error;
      } catch (error) {
        toast.error('Erro ao salvar anotação');
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

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
    // Only count attractions that still exist in the current attractions list
    return selectedAttractions.filter(a => 
      a.parkName === park.name && 
      park.attractions.some(attr => attr.name === a.attractionName)
    ).length;
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
    window.open('https://wa.me/message/TRKS54CVGEGUK1', '_blank');
  };

  if (loading || parksLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (parksError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-destructive mb-4">Erro ao carregar atrações</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (parks.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Nenhuma atração disponível</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO title="Atrações Desejadas" description="Descubra as melhores atrações dos parques de Orlando e planeje seu roteiro." />
      <SavingIndicator isSaving={saving} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              {t('attractions.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('attractions.subtitle')}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{selectedAttractions.length}</div>
              <div className="text-xs text-muted-foreground">{t('attractions.selected')}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(selectedAttractions.map(a => a.parkName)).size}
              </div>
              <div className="text-xs text-muted-foreground">{t('dashboard.tripSummary.parks')}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedAttractions.filter(a => 
                  parks.flatMap(p => p.attractions.filter(att => att.mustDo && att.name === a.attractionName)).length > 0
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">{t('attractions.mustDo')}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(notes).filter(n => n.trim()).length}
              </div>
              <div className="text-xs text-muted-foreground">{t('attractions.addNote')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Attention Message */}
        <Card className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="p-1.5 bg-amber-500/20 rounded-full shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  ⚠️ Atenção para gerar o melhor roteiro:
                </p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• O <Link to="/perfil" className="text-primary hover:underline font-medium">Perfil de Viagem</Link> deve estar o mais completo possível</li>
                  <li>• Selecione as atrações desejadas nos respectivos parques abaixo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Parks Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full overflow-x-auto flex-nowrap sm:flex-wrap h-auto gap-1 bg-muted/50 p-2 rounded-xl justify-start">
            {parks.map(park => (
              <TabsTrigger 
                key={park.id} 
                value={park.id}
                className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background shrink-0"
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
                                {getContentId(attraction.name) && (
                                  <Link
                                    to={`/conteudos?video=${getContentId(attraction.name)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                  >
                                    <Play className="w-3 h-3" />
                                    {t('attractions.watchVideo')}
                                  </Link>
                                )}
                              </div>
                              
                              {selected && (
                                <div className="mt-3">
                                  <AttractionNoteField
                                    placeholder={t('attractions.notePlaceholder')}
                                    value={notes[noteKey] || ''}
                                    rows={2}
                                    onCommit={(value) => commitNote(park.name, attraction.name, value)}
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