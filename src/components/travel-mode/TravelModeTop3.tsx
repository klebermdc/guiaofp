import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Navigation, MapPin, DollarSign, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTop3ForPark, TOP3_CATEGORIES, type Top3Category, type Top3Item } from '@/data/travelModeTop3Data';
import { useTravelMode } from '@/contexts/TravelModeContext';

import docesImg from '@/assets/travel-mode/top3-doces.jpg';
import restaurantesImg from '@/assets/travel-mode/top3-restaurantes.jpg';
import snacksImg from '@/assets/travel-mode/top3-snacks.jpg';

const categoryImages: Record<Top3Category, string> = {
  doces: docesImg,
  restaurantes: restaurantesImg,
  snacks: snacksImg,
};

interface TravelModeTop3Props {
  parkId: string;
  parkName: string;
  onNavigateToLocation: (locationName: string) => void;
}

const Top3ItemCard = memo(({ item, index, onNavigate }: { 
  item: Top3Item; 
  index: number;
  onNavigate: (locationName: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-3 hover:border-primary/30 transition-all group"
  >
    {/* Ranking badge */}
    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg z-10">
      <span className="text-xs font-bold text-white">{index + 1}</span>
    </div>

    <div className="flex gap-3">
      {/* Emoji avatar */}
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 mt-0.5">
        {item.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h4 className="text-sm font-semibold text-foreground leading-tight pr-2">
          {item.name}
        </h4>
        
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{item.location}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="truncate text-primary/80">{item.area}</span>
        </div>

        {item.price && (
          <div className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
            <DollarSign className="w-3 h-3" />
            {item.price}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Navigate button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] gap-1 px-2 mt-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          onClick={() => onNavigate(item.location)}
        >
          <Navigation className="w-3 h-3" />
          Navegar no mapa
        </Button>
      </div>
    </div>
  </motion.div>
));
Top3ItemCard.displayName = 'Top3ItemCard';

const TravelModeTop3Component = ({ parkId, parkName, onNavigateToLocation }: TravelModeTop3Props) => {
  const { isTravelMode } = useTravelMode();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Top3Category>('doces');

  const parkData = getTop3ForPark(parkId);

  const handleNavigate = useCallback((locationName: string) => {
    onNavigateToLocation(locationName);
    setIsOpen(false);
  }, [onNavigateToLocation]);

  // Only show in travel mode and if we have data for this park
  if (!isTravelMode || !parkData) return null;

  const items = parkData[activeCategory];
  const categoryMeta = TOP3_CATEGORIES[activeCategory];

  return (
    <>
      {/* Floating trigger button - positioned on the left side */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 lg:bottom-6 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">Top 3</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom sheet drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-background rounded-t-3xl shadow-2xl overflow-hidden"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header with hero image */}
              <div className="relative h-28 mx-4 rounded-2xl overflow-hidden mb-3">
                <img 
                  src={categoryImages[activeCategory]} 
                  alt={categoryMeta.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{categoryMeta.emoji}</span>
                    <h2 className="text-lg font-bold text-white">
                      {categoryMeta.label}
                    </h2>
                  </div>
                  <p className="text-xs text-white/70">{parkName}</p>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 px-4 mb-3">
                {(Object.keys(TOP3_CATEGORIES) as Top3Category[]).map((cat) => {
                  const meta = TOP3_CATEGORIES[cat];
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${meta.gradient} text-white shadow-md`
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span>{meta.emoji}</span>
                      <span className="hidden sm:inline">{meta.label}</span>
                      <span className="sm:hidden">{cat === 'doces' ? 'Doces' : cat === 'restaurantes' ? 'Comida' : 'Snacks'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Items list */}
              <ScrollArea className="px-4 pb-6" style={{ maxHeight: 'calc(85vh - 220px)' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 pb-4"
                  >
                    {items.map((item, index) => (
                      <Top3ItemCard
                        key={`${activeCategory}-${index}`}
                        item={item}
                        index={index}
                        onNavigate={handleNavigate}
                      />
                    ))}

                    {/* Pro tip */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-2">
                      <span className="text-sm">💡</span>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                        <strong>Dica:</strong> Toque em "Navegar no mapa" para encontrar o local exato e traçar rota até lá!
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const TravelModeTop3 = memo(TravelModeTop3Component);
