import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Star, Play, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoModal } from '@/components/map/VideoModal';
import { useAttractions } from '@/hooks/useAttractions';

interface AttractionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkName: string;
}

export const AttractionsModal = ({ open, onOpenChange, parkName }: AttractionsModalProps) => {
  const { user } = useAuth();
  const { parks, isLoading: parksLoading } = useAttractions();
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentItems, setContentItems] = useState<Array<{ id: string; title: string | null; attraction_name: string | null; file_url: string | null }>>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string }>({ url: '', title: '' });

  // Find the park data from the hook
  const park = useMemo(() => {
    const normalizedName = parkName.toLowerCase().replace(/\s+/g, '-');
    return parks.find(p => 
      p.id === normalizedName || 
      p.name.toLowerCase() === parkName.toLowerCase()
    );
  }, [parks, parkName]);

  // Load user preferences and content items when modal opens
  useEffect(() => {
    if (open && user && park) {
      loadPreferences();
      loadContentItems();
    }
  }, [open, user, park]);

  const loadContentItems = async () => {
    try {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, attraction_name, file_url')
        .eq('type', 'video')
        .eq('is_published', true);
      
      if (data) {
        setContentItems(data);
      }
    } catch (error) {
      console.error('Error loading content items:', error);
    }
  };

  // Normaliza string para comparação
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const getContentData = (attractionName: string) => {
    const normalizedAttractionName = normalizeString(attractionName);
    const content = contentItems.find(
      item => 
        normalizeString(item.title || '') === normalizedAttractionName ||
        normalizeString(item.attraction_name || '') === normalizedAttractionName
    );
    return content ? { id: content.id, url: content.file_url } : null;
  };

  const handlePlayVideo = (url: string, title: string) => {
    setCurrentVideo({ url, title });
    setVideoModalOpen(true);
  };

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

  if (parksLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
  <>
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {park.attractions.map((attraction) => {
                const isSelected = selectedAttractions.has(attraction.name);
                const contentData = getContentData(attraction.name);
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
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              <Zap className="h-2.5 w-2.5 mr-0.5" />
                              {attraction.type === 'ride' ? 'Atração' : attraction.type === 'show' ? 'Show' : 'Experiência'}
                            </Badge>
                            {contentData?.url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayVideo(contentData.url!, attraction.name);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                <Play className="h-3 w-3" />
                                Assistir vídeo
                              </button>
                            )}
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
        </div>

        <div className="p-4 border-t bg-muted/30">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Concluir Seleção ({selectedAttractions.size} atrações)
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <VideoModal
      isOpen={videoModalOpen}
      onClose={() => setVideoModalOpen(false)}
      videoUrl={currentVideo.url}
      title={currentVideo.title}
    />
  </>
  );
};

export default AttractionsModal;
