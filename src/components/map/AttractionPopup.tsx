import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OverlayView } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { VideoModal } from './VideoModal';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Navigation,
  Loader2,
  X,
  Ruler,
  Flame,
  Play,
  Heart,
  Check,
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
  const isMobile = useIsMobile();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isInPreferences, setIsInPreferences] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showInlineVideo, setShowInlineVideo] = useState(false);

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

  // Mobile: Render as centered modal portal
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Close only if clicking backdrop
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            data-attraction-popup="true"
            className="bg-background rounded-2xl shadow-2xl border-2 overflow-hidden w-full max-w-[340px]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-foreground text-base leading-tight flex-1 pr-1">
                  {attraction.name}
                </h3>
                <button
                  onClick={onClose}
                  className="shrink-0 p-1.5 rounded-full hover:bg-muted transition-colors -mt-0.5 -mr-1"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
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
              {(displayData.minHeight || displayData.thrillLevel) && (
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

              {/* Description */}
              {(contentItem?.attraction_description || attraction.description) && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {contentItem?.attraction_description || attraction.description}
                </p>
              )}
            </div>

            {/* Video Section - Mobile */}
            {contentItem?.file_url && (
              <div className="px-3 pb-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowVideoModal(true);
                  }}
                  className="w-full relative overflow-hidden rounded-xl group cursor-pointer touch-manipulation"
                >
                  {/* Thumbnail with gradient overlay */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={contentItem.thumbnail_url || getYoutubeThumbnail(contentItem.file_url) || ''}
                      alt={attraction.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-active:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = getYoutubeThumbnail(contentItem.file_url!) || '';
                      }}
                    />
                  </div>
                  
                  {/* Animated play overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
                    <motion.div 
                      className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 12px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0.4)']
                      }}
                      transition={{ 
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  
                  {/* Label with icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                        <Play className="w-3 h-3 text-white" fill="currentColor" />
                      </div>
                      <span className="text-white text-xs font-semibold drop-shadow-lg">Assistir vídeo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-3 flex gap-2 border-t">
              {user && (
                <Button
                  variant={isInPreferences ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={togglePreference}
                  disabled={savingPreference}
                  className="h-10 w-10 p-0"
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
                className="flex-1 h-10 text-sm font-bold"
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
          </motion.div>

          {/* Video Modal */}
          {contentItem?.file_url && (
            <VideoModal
              isOpen={showVideoModal}
              onClose={() => setShowVideoModal(false)}
              videoUrl={contentItem.file_url}
              title={attraction.name}
            />
          )}
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // Desktop: Render anchored to map position
  return (
    <OverlayView
      position={attraction.position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
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
        <div
          data-attraction-popup="true"
          className="bg-background rounded-xl shadow-2xl border-2 overflow-hidden w-[280px] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
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
            {(displayData.minHeight || displayData.thrillLevel) && (
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

            {/* Description */}
            {(contentItem?.attraction_description || attraction.description) && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {contentItem?.attraction_description || attraction.description}
              </p>
            )}
          </div>

          {/* Video Section - Desktop inline */}
          {contentItem?.file_url && (
            <div className="px-2 pb-2">
              {showInlineVideo ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  {contentItem.file_url.includes('youtube') || contentItem.file_url.includes('youtu.be') ? (
                    <iframe
                      src={`${getYoutubeEmbedUrl(contentItem.file_url)}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      src={contentItem.file_url}
                      controls
                      autoPlay
                      className="w-full h-full"
                    />
                  )}
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInlineVideo(true);
                  }}
                  className="w-full relative overflow-hidden rounded-xl group cursor-pointer"
                >
                  {/* Thumbnail with gradient overlay */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={contentItem.thumbnail_url || getYoutubeThumbnail(contentItem.file_url) || ''}
                      alt={attraction.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = getYoutubeThumbnail(contentItem.file_url!) || '';
                      }}
                    />
                  </div>
                  
                  {/* Animated play overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
                    <motion.div 
                      className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 12px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0.4)']
                      }}
                      transition={{ 
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  
                  {/* Label with icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                        <Play className="w-3 h-3 text-white" fill="currentColor" />
                      </div>
                      <span className="text-white text-xs font-semibold drop-shadow-lg">Assistir vídeo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
