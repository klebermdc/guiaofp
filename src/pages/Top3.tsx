import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, DollarSign, Sparkles, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PARKS } from '@/data/constants';

import docesImg from '@/assets/travel-mode/top3-doces.jpg';
import restaurantesImg from '@/assets/travel-mode/top3-restaurantes.jpg';
import snacksImg from '@/assets/travel-mode/top3-snacks.jpg';

import top3MagicKingdom from '@/assets/parks/top3-magic-kingdom.jpg';
import top3Epcot from '@/assets/parks/top3-epcot.jpg';
import top3HollywoodStudios from '@/assets/parks/top3-hollywood-studios.jpg';
import top3AnimalKingdom from '@/assets/parks/top3-animal-kingdom.jpg';
import top3UniversalStudios from '@/assets/parks/top3-universal-studios.jpg';
import top3IslandsOfAdventure from '@/assets/parks/top3-islands-of-adventure.jpg';
import top3EpicUniverse from '@/assets/parks/top3-epic-universe.jpg';

const parkImages: Record<string, string> = {
  'dd6b79b8-d934-4e15-8967-1f1af1911fef': top3MagicKingdom,
  '03e87b8e-7467-4121-971b-91826dd55bec': top3Epcot,
  'ffdca010-b62c-40cc-98ee-37a853da037d': top3HollywoodStudios,
  '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205': top3AnimalKingdom,
  'c63c98b3-1cef-4d90-8142-0a68331907e1': top3UniversalStudios,
  '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148': top3IslandsOfAdventure,
  'ba562b14-26bf-4b12-a13d-2aa7df43297e': top3EpicUniverse,
};

type Top3Category = 'doces' | 'restaurantes' | 'snacks';

const categoryImages: Record<Top3Category, string> = {
  doces: docesImg,
  restaurantes: restaurantesImg,
  snacks: snacksImg,
};

const CATEGORIES: Record<Top3Category, { label: string; emoji: string; gradient: string }> = {
  doces: { label: 'Top Doces', emoji: '🍰', gradient: 'from-pink-500 to-rose-600' },
  restaurantes: { label: 'Top Restaurantes', emoji: '🍽️', gradient: 'from-orange-500 to-amber-600' },
  snacks: { label: 'Top Snacks', emoji: '🧂', gradient: 'from-emerald-500 to-green-600' },
};

interface Top3Row {
  id: string;
  item_name: string;
  location: string;
  area: string;
  price: string | null;
  description: string;
  emoji: string;
  image_url: string | null;
  category: string;
  sort_order: number;
  park_id: string;
  park_name: string;
  restaurant_id: string | null;
  restaurant_latitude: number | null;
  restaurant_longitude: number | null;
  restaurant_slug: string | null;
}

// Only parks that have Top 3 content
const TOP3_PARKS = PARKS.filter(p => [
  'dd6b79b8-d934-4e15-8967-1f1af1911fef', // Magic Kingdom
  '03e87b8e-7467-4121-971b-91826dd55bec', // EPCOT
  'ffdca010-b62c-40cc-98ee-37a853da037d', // Hollywood Studios
  '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', // Animal Kingdom
  'c63c98b3-1cef-4d90-8142-0a68331907e1', // Universal Studios
  '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', // Islands of Adventure
  'ba562b14-26bf-4b12-a13d-2aa7df43297e', // Epic Universe
].includes(p.id));

const Top3ItemCard = memo(({ item, index, onNavigate }: {
  item: Top3Row;
  index: number;
  onNavigate: (item: Top3Row) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="relative bg-card rounded-2xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow"
  >
    {/* Ranking badge */}
    <div className="absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg z-10">
      <span className="text-xs font-bold text-white">{index + 1}</span>
    </div>

    <div className="flex gap-3">
      {/* Image / emoji */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          item.emoji
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h4 className="text-sm font-semibold text-foreground leading-tight pr-2">
          {item.item_name}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <MapPin className="w-3 h-3 shrink-0 text-primary" />
          <span className="truncate">{item.location}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-primary/70 truncate">{item.area}</span>
        </div>

        {item.price && (
          <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
            <DollarSign className="w-3 h-3" />
            {item.price}
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="flex gap-1.5 mt-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] gap-1 px-2.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={() => onNavigate(item)}
          >
            <Navigation className="w-3 h-3" />
            Ver no mapa
          </Button>
          {item.restaurant_latitude && item.restaurant_longitude && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] gap-1 px-2.5 border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white transition-all"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${item.restaurant_latitude},${item.restaurant_longitude}&travelmode=walking`,
                  '_blank'
                );
              }}
            >
              <MapPin className="w-3 h-3" />
              Traçar Rota
            </Button>
          )}
        </div>
      </div>
    </div>
  </motion.div>
));
Top3ItemCard.displayName = 'Top3ItemCard';

const Top3Page = () => {
  const navigate = useNavigate();
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Top3Category>('doces');

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['travel-mode-top3-all'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_mode_top3')
        .select('id, item_name, location, area, price, description, emoji, image_url, category, sort_order, park_id, park_name, restaurant_id, restaurants:restaurant_id(latitude, longitude, slug)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((item: any) => ({
        ...item,
        restaurant_latitude: item.restaurants?.latitude ?? null,
        restaurant_longitude: item.restaurants?.longitude ?? null,
        restaurant_slug: item.restaurants?.slug ?? null,
      })) as Top3Row[];
    },
  });

  // Get unique parks that actually have items
  const availableParks = TOP3_PARKS.filter(p => allItems.some(i => i.park_id === p.id));

  const selectedPark = selectedParkId
    ? availableParks.find(p => p.id === selectedParkId)
    : null;

  const filteredItems = selectedPark
    ? allItems.filter(i => i.park_id === selectedPark.id && i.category === activeCategory)
    : [];

  const handleNavigateToMap = useCallback((item: Top3Row) => {
    const params = new URLSearchParams({ park: item.park_id });
    if (item.restaurant_id) params.set('restaurant_id', item.restaurant_id);
    if (item.restaurant_latitude && item.restaurant_longitude) {
      params.set('lat', String(item.restaurant_latitude));
      params.set('lng', String(item.restaurant_longitude));
    }
    params.set('search', item.location);
    navigate(`/mapa?${params.toString()}`);
  }, [navigate]);

  const categoryMeta = CATEGORIES[activeCategory];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-bold text-foreground">Top 3 nos Parques</h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          {/* Park selection grid */}
          {!selectedPark ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Escolha um parque para ver as melhores recomendações de comida 🍕
              </p>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableParks.map((park) => {
                    const parkItems = allItems.filter(i => i.park_id === park.id);
                    const parkImg = parkImages[park.id];
                    return (
                      <motion.button
                        key={park.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedParkId(park.id)}
                        className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group h-36 sm:h-40"
                      >
                        {parkImg && (
                          <img src={parkImg} alt={park.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                          <h3 className="text-sm font-bold text-white leading-tight">{park.name}</h3>
                          <span className="text-[11px] text-white/70">
                            {parkItems.length} recomendações
                          </span>
                        </div>
                        <ChevronRight className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Back to park selection */}
              <button
                onClick={() => setSelectedParkId(null)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Trocar parque
              </button>

              {/* Hero image */}
              <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden">
                <img
                  src={categoryImages[activeCategory]}
                  alt={categoryMeta.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{categoryMeta.emoji}</span>
                    <h2 className="text-lg font-bold text-white">{categoryMeta.label}</h2>
                  </div>
                  <p className="text-xs text-white/70">{selectedPark.name}</p>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2">
                {(Object.keys(CATEGORIES) as Top3Category[]).map((cat) => {
                  const meta = CATEGORIES[cat];
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedPark.id}-${activeCategory}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pb-4"
                >
                  {filteredItems.map((item, index) => (
                    <Top3ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      onNavigate={handleNavigateToMap}
                    />
                  ))}

                  {filteredItems.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma recomendação cadastrada para esta categoria.
                    </p>
                  )}

                  {filteredItems.length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-sm">💡</span>
                      <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                        <strong>Dica:</strong> Toque em "Ver no mapa" para encontrar o local exato e traçar rota até lá!
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Top3Page;
