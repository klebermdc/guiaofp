import { createPortal } from 'react-dom';
import { OverlayView } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation, X, Clock, UtensilsCrossed } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  type: string;
  position: { lat: number; lng: number };
  description?: string;
  schedule?: string;
  menuUrl?: string;
}

interface POIConfig {
  emoji: string;
  label: string;
  color: string;
}

interface POIPopupProps {
  poi: POI;
  poiConfig: POIConfig;
  onClose: () => void;
  onNavigate: (position: { lat: number; lng: number }, name: string) => void;
  onOpenMenu?: (menuUrl: string, restaurantName: string) => void;
}

export function POIPopup({ poi, poiConfig, onClose, onNavigate, onOpenMenu }: POIPopupProps) {
  const isMobile = useIsMobile();

  const handleNavigate = () => {
    onNavigate(poi.position, poi.name);
    onClose();
  };

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onOpenMenu && poi.menuUrl) {
      onOpenMenu(poi.menuUrl, poi.name);
      // Close popup after setting the menu modal state
      setTimeout(() => {
        onClose();
      }, 50);
    }
  };

  const cardContent = (
    <div
      data-poi-popup="true"
      className="bg-background rounded-xl shadow-2xl border-2 overflow-hidden w-[260px] max-w-[90vw]"
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">{poiConfig.emoji}</span>
              <span 
                className="text-xs font-medium"
                style={{ color: poiConfig.color }}
              >
                {poiConfig.label}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{poi.name}</p>
            
            {/* Description */}
            {poi.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                {poi.description}
              </p>
            )}
            
            {/* Schedule for shows */}
            {poi.schedule && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{poi.schedule}</span>
              </div>
            )}
            
            {/* Menu button for restaurants - opens modal */}
            {poi.type === 'restaurant' && poi.menuUrl && (
              <button
                onClick={handleOpenMenu}
                className="flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
              >
                <UtensilsCrossed className="w-3 h-3" />
                Ver cardápio
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors -mt-0.5 -mr-1"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <Button
          size="sm"
          className="w-full mt-2 h-8 text-xs"
          onClick={handleNavigate}
        >
          <Navigation className="w-3 h-3 mr-1" />
          Ir para cá
        </Button>
      </div>
    </div>
  );

  // Mobile: Use portal to render centered modal
  if (isMobile) {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
        
        {/* Card */}
        <motion.div
          data-poi-popup="true"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {cardContent}
        </motion.div>
      </motion.div>,
      document.body
    );
  }

  // Desktop: Render anchored above the marker using OverlayView
  return (
    <OverlayView
      position={poi.position}
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

        {cardContent}
      </motion.div>
    </OverlayView>
  );
}
