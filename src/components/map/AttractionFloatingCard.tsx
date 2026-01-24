import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  attraction_description: string | null;
  min_height: string | null;
  thrill_level: number | null;
  pass_type: string | null;
}

interface AttractionFloatingCardProps {
  attraction: Attraction | null;
  parkName: string;
  onClose: () => void;
  onNavigate: (position: { lat: number; lng: number }, name: string) => void;
  isCalculatingRoute: boolean;
}

export function AttractionFloatingCard({
  attraction,
  parkName,
  onClose,
  onNavigate,
  isCalculatingRoute,
}: AttractionFloatingCardProps) {
  const { user } = useAuth();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isInPreferences, setIsInPreferences] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (attraction) {
      loadContent();
      setShowVideo(false);
      if (user) {
        checkPreference();
      }
    } else {
      setContentItem(null);
      setIsInPreferences(false);
      setShowVideo(false);
    }
  }, [attraction?.id, user]);

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
    
    const { data } = await supabase
      .from('content_items')
      .select('id, title, description, file_url, attraction_description, min_height, thrill_level, pass_type')
      .eq('is_published', true);
    
    if (data) {
      const normalizedAttractionName = normalizeString(attraction.name);
      const matched = data.find(item => {
        const contentName = normalizeString(item.title);
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
        toast.success('Removida');
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
        toast.success('Adicionada');
      }
    } catch (error) {
      toast.error('Erro');
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

  const displayData = {
    minHeight: contentItem?.min_height || attraction?.minHeight,
    thrillLevel: contentItem?.thrill_level || attraction?.thrillLevel,
    passType: contentItem?.pass_type || attraction?.passType,
    description: contentItem?.attraction_description || contentItem?.description || attraction?.description,
  };

  if (!attraction) return null;

  return (
    <div className="absolute bottom-4 left-2 right-2 z-30 safe-area-bottom">
      <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-2 overflow-hidden max-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="p-3 pb-2 border-b shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-base leading-tight truncate pr-2">
                {attraction.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge className={`${getWaitTimeColor(attraction.waitTime)} text-xs px-2 py-0`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : '—'}
                </Badge>
                {attraction.isOpen !== undefined && (
                  <span className={`text-xs font-medium ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {attraction.isOpen ? '● Aberto' : '● Fechado'}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 -mt-1 -mr-1"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-3 pt-2 space-y-2">
          {/* Technical specs - compact */}
          {(displayData.minHeight || displayData.thrillLevel || displayData.passType) && (
            <div className="flex items-center gap-3 flex-wrap text-xs">
              {displayData.minHeight && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Ruler className="h-3 w-3" />
                  <span>{displayData.minHeight}</span>
                </div>
              )}
              {displayData.passType && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Ticket className="h-3 w-3" />
                  <span className="truncate max-w-[80px]">{displayData.passType}</span>
                </div>
              )}
              {displayData.thrillLevel && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-muted-foreground" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= displayData.thrillLevel!
                            ? getThrillLevelColor(level)
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description - compact */}
          {displayData.description && (
            <p className="text-muted-foreground text-xs line-clamp-2">
              {displayData.description}
            </p>
          )}

          {/* Video Section - compact */}
          {isLoadingContent ? (
            <div className="h-10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : contentItem?.file_url ? (
            showVideo ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black max-h-[120px]">
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideo(true)}
                className="w-full h-8 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Ver vídeo exclusivo
              </Button>
            )
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-3 pt-2 border-t shrink-0 flex gap-2">
          {user && (
            <Button
              variant={isInPreferences ? 'secondary' : 'outline'}
              size="sm"
              onClick={togglePreference}
              disabled={savingPreference}
              className="h-10 px-3"
            >
              {savingPreference ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isInPreferences ? (
                <Check className="w-4 h-4" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            onClick={() => onNavigate(attraction.position, attraction.name)}
            disabled={isCalculatingRoute}
            className="flex-1 h-10 font-bold"
          >
            {isCalculatingRoute ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Navegar até aqui
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
