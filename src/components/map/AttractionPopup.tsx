import { useState, useEffect } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { motion } from 'framer-motion';
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
  Play,
  Heart,
  Check,
  ChevronUp,
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
  file_url: string | null;
  thumbnail_url: string | null;
  min_height: string | null;
  thrill_level: number | null;
  pass_type: string | null;
  attraction_description: string | null;
}

interface AttractionPopupProps {
  attraction: Attraction;
  parkName: string;
  onClose: () => void;
  onNavigate: (position: { lat: number; lng: number }, name: string) => void;
  isCalculatingRoute: boolean;
}

export function AttractionPopup({
  attraction,
  parkName,
  onClose,
  onNavigate,
  isCalculatingRoute,
}: AttractionPopupProps) {
  const { user } = useAuth();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isInPreferences, setIsInPreferences] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadContent();
    if (user) checkPreference();
  }, [attraction.id, user]);

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const loadContent = async () => {
    const { data } = await supabase
      .from('content_items')
      .select('id, title, file_url, thumbnail_url, min_height, thrill_level, pass_type, attraction_description')
      .eq('is_published', true);

    if (data) {
      const normalizedName = normalizeString(attraction.name);
      const matched = data.find(item => {
        const contentName = normalizeString(item.title);
        return normalizedName === contentName ||
          normalizedName.includes(contentName) ||
          contentName.includes(normalizedName);
      });
      setContentItem(matched || null);
    }
  };

  const checkPreference = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('attraction_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('attraction_name', attraction.name)
      .maybeSingle();
    setIsInPreferences(!!data);
  };

  const togglePreference = async () => {
    if (!user) return;
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
    } catch {
      toast.error('Erro');
    } finally {
      setSavingPreference(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  const displayData = {
    minHeight: contentItem?.min_height || attraction.minHeight,
    thrillLevel: contentItem?.thrill_level || attraction.thrillLevel,
    passType: contentItem?.pass_type || attraction.passType,
  };

  return (
    <OverlayView
      position={attraction.position}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <motion.div 
        className="relative"
        style={{ transform: 'translate(-50%, -100%)', marginTop: '-20px' }}
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Arrow pointer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-background" />
        </div>

        {/* Popup Card */}
        <div className="bg-background rounded-xl shadow-2xl border-2 overflow-hidden w-[280px] max-w-[90vw]">
          {/* Header */}
          <div className="p-3 pb-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-sm leading-tight flex-1 pr-1">
                {attraction.name}
              </h3>
              <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors -mt-0.5 -mr-1"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={`${getWaitTimeColor(attraction.waitTime)} text-xs h-5`}>
                {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : '—'}
              </Badge>
              {attraction.isOpen !== undefined && (
                <span className={`text-xs font-medium ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  ● {attraction.isOpen ? 'Aberto' : 'Fechado'}
                </span>
              )}
            </div>

            {/* Technical specs */}
            {(displayData.minHeight || displayData.passType) && (
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {displayData.minHeight && (
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {displayData.minHeight}
                  </span>
                )}
                {displayData.thrillLevel && (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {displayData.thrillLevel}/5
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Video Section with Thumbnail */}
          {contentItem?.file_url && (
            <>
              {!isExpanded ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full relative overflow-hidden rounded-lg group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted">
                    <img
                      src={contentItem.thumbnail_url || getYoutubeThumbnail(contentItem.file_url) || ''}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getYoutubeThumbnail(contentItem.file_url!) || '';
                      }}
                    />
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-white text-xs font-medium">Vídeo exclusivo</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-1">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {contentItem.file_url.includes('youtube') || contentItem.file_url.includes('youtu.be') ? (
                      <iframe
                        src={getYoutubeEmbedUrl(contentItem.file_url)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video src={contentItem.file_url} controls className="w-full h-full" />
                    )}
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1"
                  >
                    <ChevronUp className="w-3 h-3" />
                    Ocultar vídeo
                  </button>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="p-2 flex gap-2 border-t">
            {user && (
              <Button
                variant={isInPreferences ? 'secondary' : 'outline'}
                size="sm"
                onClick={togglePreference}
                disabled={savingPreference}
                className="h-9 w-9 p-0"
              >
                {savingPreference ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isInPreferences ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              onClick={() => onNavigate(attraction.position, attraction.name)}
              disabled={isCalculatingRoute}
              className="flex-1 h-9 text-sm font-bold"
            >
              {isCalculatingRoute ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-1" />
                  Navegar
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </OverlayView>
  );
}
