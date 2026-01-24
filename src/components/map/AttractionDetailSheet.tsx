import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Navigation,
  Loader2,
  X,
  Ruler,
  Flame,
  Ticket,
  Play,
  Heart,
  Check,
  Sparkles,
  Clock,
} from 'lucide-react';

interface Attraction {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  description: string;
  waitTime?: number;
  isOpen?: boolean;
  thrillLevel?: number;
  minHeight?: string;
  passType?: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  attraction_name: string | null;
  attraction_description: string | null;
  min_height: string | null;
  thrill_level: number | null;
  pass_type: string | null;
}

interface AttractionDetailSheetProps {
  attraction: Attraction | null;
  parkName: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (position: { lat: number; lng: number }, name: string) => void;
  isCalculatingRoute: boolean;
}

export function AttractionDetailSheet({
  attraction,
  parkName,
  isOpen,
  onClose,
  onNavigate,
  isCalculatingRoute,
}: AttractionDetailSheetProps) {
  const { user } = useAuth();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isInPreferences, setIsInPreferences] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  // Load content and preferences when attraction changes
  useEffect(() => {
    if (attraction && isOpen) {
      loadContent();
      if (user) {
        checkPreference();
      }
    } else {
      setContentItem(null);
      setIsInPreferences(false);
    }
  }, [attraction?.id, isOpen, user]);

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const loadContent = async () => {
    if (!attraction) return;
    
    setIsLoadingContent(true);
    
    // Try to find content by matching attraction name
    const { data } = await supabase
      .from('content_items')
      .select('id, title, description, file_url, thumbnail_url, attraction_name, attraction_description, min_height, thrill_level, pass_type')
      .eq('is_published', true);
    
    if (data) {
      // Find matching content
      const normalizedAttractionName = normalizeString(attraction.name);
      const matched = data.find(item => {
        const contentName = normalizeString(item.attraction_name || item.title);
        return normalizedAttractionName === contentName || 
               normalizedAttractionName.includes(contentName) ||
               contentName.includes(normalizedAttractionName);
      });
      
      setContentItem(matched || null);
    }
    
    setIsLoadingContent(false);
  };

  const checkPreference = async () => {
    if (!user || !attraction) return;
    
    const { data } = await supabase
      .from('attraction_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('attraction_name', attraction.name)
      .maybeSingle();
    
    setIsInPreferences(!!data);
  };

  const togglePreference = async () => {
    if (!user || !attraction) return;
    
    setSavingPreference(true);
    
    try {
      if (isInPreferences) {
        await supabase
          .from('attraction_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('attraction_name', attraction.name);
        
        setIsInPreferences(false);
        toast.success('Removida das desejadas');
      } else {
        await supabase
          .from('attraction_preferences')
          .insert({
            user_id: user.id,
            park_name: parkName,
            attraction_name: attraction.name,
            priority: 1,
          });
        
        setIsInPreferences(true);
        toast.success('Adicionada às desejadas');
      }
    } catch (error) {
      console.error('Error toggling preference:', error);
      toast.error('Erro ao atualizar');
    } finally {
      setSavingPreference(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getThrillLevelColor = (level: number) => {
    if (level <= 2) return 'bg-green-500';
    if (level <= 3) return 'bg-yellow-500';
    if (level <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get display data (prioritize content_items data over marker data)
  const displayData = {
    minHeight: contentItem?.min_height || attraction?.minHeight,
    thrillLevel: contentItem?.thrill_level || attraction?.thrillLevel,
    passType: contentItem?.pass_type || attraction?.passType,
    description: contentItem?.attraction_description || contentItem?.description || attraction?.description,
  };

  if (!attraction) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl px-0 overflow-hidden flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground pr-8 leading-tight">
              {attraction.name}
            </h2>
            
            {/* Status badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={getWaitTimeColor(attraction.waitTime)}>
                <Clock className="w-3 h-3 mr-1" />
                {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : 'Sem dados'}
              </Badge>
              
              {attraction.isOpen !== undefined && (
                <Badge variant={attraction.isOpen ? 'default' : 'destructive'}>
                  {attraction.isOpen ? '● Aberto' : '● Fechado'}
                </Badge>
              )}
            </div>
          </div>

          {/* Technical specs */}
          {(displayData.minHeight || displayData.thrillLevel || displayData.passType) && (
            <div className="bg-muted/50 rounded-xl p-4 mb-4 border">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Ficha Técnica
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {displayData.minHeight && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Ruler className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Altura</span>
                      <p className="font-medium text-foreground text-sm">{displayData.minHeight}</p>
                    </div>
                  </div>
                )}
                
                {displayData.passType && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Ticket className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Passe</span>
                      <p className="font-medium text-foreground text-sm truncate max-w-[100px]">{displayData.passType}</p>
                    </div>
                  </div>
                )}
                
                {displayData.thrillLevel && (
                  <div className="flex items-center gap-2 col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Radicalidade</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-4 h-4 rounded-full ${
                              level <= displayData.thrillLevel!
                                ? getThrillLevelColor(level)
                                : 'bg-muted-foreground/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {displayData.description && (
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {displayData.description}
            </p>
          )}

          {/* Video Section */}
          {isLoadingContent ? (
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : contentItem?.file_url ? (
            <div className="mb-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                <Play className="h-4 w-4 text-primary" />
                Vídeo Exclusivo
              </h4>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                {contentItem.file_url.includes('youtube') || contentItem.file_url.includes('youtu.be') ? (
                  <iframe
                    src={getYoutubeEmbedUrl(contentItem.file_url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={contentItem.file_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          ) : null}

          {/* Add to favorites */}
          {user && (
            <Button
              variant={isInPreferences ? 'default' : 'outline'}
              onClick={togglePreference}
              disabled={savingPreference}
              className="w-full mb-4"
            >
              {savingPreference ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isInPreferences ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              {isInPreferences ? 'Nas minhas desejadas' : 'Adicionar às desejadas'}
            </Button>
          )}
        </div>

        {/* Fixed Navigation Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            onClick={() => onNavigate(attraction.position, attraction.name)}
            disabled={isCalculatingRoute}
            className="w-full h-14 text-base font-bold shadow-xl"
            size="lg"
          >
            {isCalculatingRoute ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Calculando rota...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                Navegar até aqui
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
