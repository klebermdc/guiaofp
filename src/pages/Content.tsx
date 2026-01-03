import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Play, Sparkles, Loader2, ArrowLeft, MapPin, Ruler, Flame, Ticket } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import park images
import magicKingdomImg from '@/assets/parks/magic-kingdom.jpg';
import epcotImg from '@/assets/parks/epcot.jpg';
import hollywoodStudiosImg from '@/assets/parks/hollywood-studios.jpg';
import animalKingdomImg from '@/assets/parks/animal-kingdom.jpg';
import islandsOfAdventureImg from '@/assets/parks/islands-of-adventure.jpg';
import universalStudiosImg from '@/assets/parks/universal-studios.jpg';
import epicUniverseImg from '@/assets/parks/epic-universe.jpg';

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

// Parks data with their images
const PARKS = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    image: magicKingdomImg,
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 'epcot',
    name: 'Epcot',
    image: epcotImg,
    color: 'from-teal-500 to-blue-600',
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    image: hollywoodStudiosImg,
    color: 'from-red-500 to-pink-600',
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    image: animalKingdomImg,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'islands-of-adventure',
    name: 'Island of Adventure',
    image: islandsOfAdventureImg,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    image: universalStudiosImg,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    image: epicUniverseImg,
    color: 'from-indigo-500 to-purple-600',
  },
];

const Content = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPark, setSelectedPark] = useState<typeof PARKS[0] | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
    
    // Find category that matches park name
    const parkCategory = categories.find(cat => 
      cat.name.toLowerCase().includes(selectedPark.name.toLowerCase()) ||
      selectedPark.name.toLowerCase().includes(cat.name.toLowerCase())
    );
    
    if (parkCategory) {
      return contents.filter(c => c.category_id === parkCategory.id);
    }
    
    return [];
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-gold p-8 text-secondary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Exclusivo para membros</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              🎢 Parques
            </h1>
            <p className="text-secondary-foreground/80">
              Explore os vídeos das atrações de cada parque
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedPark ? (
          // Parks Grid
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Escolha um Parque
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {PARKS.map((park) => (
                <Card 
                  key={park.id}
                  className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setSelectedPark(park)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={park.image} 
                      alt={park.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${park.color} opacity-60`} />
                    <div className="absolute inset-0 flex items-end p-4">
                      <h3 className="font-display text-lg font-bold text-white drop-shadow-lg">
                        {park.name}
                      </h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Park Videos
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPark(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedPark.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {selectedPark.name}
                </h2>
              </div>
            </div>

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
                  onClick={() => setSelectedPark(null)}
                >
                  Ver outros parques
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
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
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
                      
                      {/* Ficha Técnica no Card */}
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
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                      key={level}
                                      className={`w-2 h-2 rounded-full ${
                                        level <= item.thrill_level!
                                          ? level <= 2
                                            ? 'bg-green-500'
                                            : level <= 3
                                            ? 'bg-yellow-500'
                                            : level <= 4
                                            ? 'bg-orange-500'
                                            : 'bg-red-500'
                                          : 'bg-muted-foreground/20'
                                      }`}
                                    />
                                  ))}
                                </div>
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
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {/* Ficha Técnica da Atração */}
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
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-4 h-4 rounded-full ${
                                  level <= selectedContent.thrill_level!
                                    ? level <= 2
                                      ? 'bg-green-500'
                                      : level <= 3
                                      ? 'bg-yellow-500'
                                      : level <= 4
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                                    : 'bg-muted-foreground/20'
                                }`}
                              />
                            ))}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Content;
