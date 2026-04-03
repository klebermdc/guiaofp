import { useState, memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, DollarSign, Sparkles, ArrowLeft, ChevronRight, Star, Share2, Flame, X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLoadScript, GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PARKS, GOOGLE_MAPS_API_KEY } from '@/data/constants';
import { toast } from 'sonner';

import top3MagicKingdom from '@/assets/parks/top3-magic-kingdom.jpg';
import top3Epcot from '@/assets/parks/top3-epcot.jpg';
import top3HollywoodStudios from '@/assets/parks/top3-hollywood-studios.jpg';
import top3AnimalKingdom from '@/assets/parks/top3-animal-kingdom.jpg';
import top3UniversalStudios from '@/assets/parks/top3-universal-studios.jpg';
import top3IslandsOfAdventure from '@/assets/parks/top3-islands-of-adventure.jpg';
import top3EpicUniverse from '@/assets/parks/top3-epic-universe.jpg';

// Map by park name (stable) — IDs are derived from PARKS constant so they stay in sync automatically
const PARK_IMAGE_BY_NAME: Record<string, string> = {
  'Magic Kingdom':       top3MagicKingdom,
  'EPCOT':               top3Epcot,
  'Hollywood Studios':   top3HollywoodStudios,
  'Animal Kingdom':      top3AnimalKingdom,
  'Universal Studios':   top3UniversalStudios,
  'Islands of Adventure':top3IslandsOfAdventure,
  'Epic Universe':       top3EpicUniverse,
};
const parkImages: Record<string, string> = Object.fromEntries(
  PARKS.filter(p => PARK_IMAGE_BY_NAME[p.name]).map(p => [p.id, PARK_IMAGE_BY_NAME[p.name]])
);

type Top3Category = 'doces' | 'restaurantes' | 'snacks';

const CATEGORIES: Record<Top3Category, { label: string; emoji: string; gradient: string; bg: string }> = {
  doces:       { label: 'Doces',       emoji: '🍰', gradient: 'from-pink-500 to-rose-600',     bg: 'bg-pink-500/10 text-pink-600 border-pink-500/30' },
  restaurantes:{ label: 'Restaurantes',emoji: '🍽️', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  snacks:      { label: 'Snacks',      emoji: '🧂', gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
};

const RANK_STYLES = [
  { medal: '🥇', bg: 'from-yellow-400 to-amber-500', ring: 'ring-amber-400/50', label: '1°' },
  { medal: '🥈', bg: 'from-slate-300 to-slate-400',  ring: 'ring-slate-300/50',  label: '2°' },
  { medal: '🥉', bg: 'from-orange-400 to-amber-700', ring: 'ring-orange-400/50', label: '3°' },
];

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

// Parks that have Top3 content — derived from the names that have images
const TOP3_PARK_IDS = PARKS.filter(p => PARK_IMAGE_BY_NAME[p.name]).map(p => p.id);

// ─── Skeleton loader ───────────────────────────────────────────
const ParkCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden h-40 bg-muted animate-pulse" />
);

const ItemCardSkeleton = () => (
  <div className="rounded-2xl border border-border/50 p-4 space-y-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  </div>
);

// ─── Mini interactive map ──────────────────────────────────────
const MINI_MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'hybrid',
  disableDefaultUI: true,
  gestureHandling: 'greedy',
  clickableIcons: false,
  styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
};

const MiniMap = memo(({ lat, lng, color = '#F97316' }: { lat: number; lng: number; color?: string }) => {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [pulse, setPulse] = useState(false);
  const center = { lat, lng };

  useEffect(() => {
    const id = setInterval(() => setPulse(v => !v), 700);
    return () => clearInterval(id);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={19}
      options={MINI_MAP_OPTIONS}
    >
      <Marker
        position={center}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          scale: 10,
        }}
      />
      <Circle
        center={center}
        radius={pulse ? 22 : 12}
        options={{
          fillColor: color,
          fillOpacity: pulse ? 0 : 0.2,
          strokeColor: color,
          strokeOpacity: pulse ? 0.3 : 0.8,
          strokeWeight: 2,
          clickable: false,
        }}
      />
    </GoogleMap>
  );
});
MiniMap.displayName = 'MiniMap';

// ─── Item card ─────────────────────────────────────────────────
const Top3ItemCard = memo(({ item, index, onNavigate, onRoute }: {
  item: Top3Row;
  index: number;
  onNavigate: (item: Top3Row) => void;
  onRoute: (item: Top3Row) => void;
}) => {
  const rank = RANK_STYLES[index] ?? RANK_STYLES[2];
  const catMeta = CATEGORIES[item.category as Top3Category];

  const handleShare = () => {
    const text = `${rank.medal} ${item.item_name} — ${item.location} (${item.area})`;
    if (navigator.share) {
      navigator.share({ title: item.item_name, text }).catch(() => null);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copiado!', { description: text, duration: 2000 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      className="relative bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Top accent line per rank */}
      <div className={`h-1 w-full bg-gradient-to-r ${rank.bg}`} />

      <div className="p-4">
        <div className="flex gap-3">
          {/* Image / emoji thumbnail */}
          <div className={`relative w-20 h-20 rounded-xl bg-muted shrink-0 overflow-hidden ring-2 ${rank.ring}`}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-muted to-muted/60">
                {item.emoji}
              </div>
            )}
            {/* Rank badge over image */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-gradient-to-br ${rank.bg} flex items-center justify-center shadow-lg border-2 border-background`}>
              <span className="text-[10px] font-black text-white">{rank.label}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold text-foreground leading-tight">
                {item.item_name}
              </h4>
              <button onClick={handleShare} className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors p-0.5">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <MapPin className="w-3 h-3 shrink-0 text-primary" />
              <span className="font-medium text-foreground/80 truncate">{item.location}</span>
              {item.area && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-primary/70 truncate">{item.area}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {item.price && (
                <Badge variant="outline" className="h-5 text-[10px] gap-0.5 px-1.5 text-green-600 border-green-500/30 bg-green-500/5">
                  <DollarSign className="w-2.5 h-2.5" />
                  {item.price}
                </Badge>
              )}
              {catMeta && (
                <Badge variant="outline" className={`h-5 text-[10px] px-1.5 ${catMeta.bg}`}>
                  {catMeta.emoji} {catMeta.label}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/20 hover:border-primary transition-all"
            variant="ghost"
            onClick={() => onNavigate(item)}
          >
            <MapPin className="w-3.5 h-3.5" />
            Ver no mapa
          </Button>
          {(item.restaurant_latitude && item.restaurant_longitude) || item.restaurant_id ? (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-500/20 hover:border-emerald-500 transition-all"
              variant="ghost"
              onClick={() => onRoute(item)}
            >
              <Navigation className="w-3.5 h-3.5" />
              Ir até lá
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
});
Top3ItemCard.displayName = 'Top3ItemCard';

// ─── Main page ─────────────────────────────────────────────────
const Top3Page = () => {
  const navigate = useNavigate();
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Top3Category>('restaurantes');
  const [mapPreviewItem, setMapPreviewItem] = useState<Top3Row | null>(null);

  const { data: allItems = [], isLoading, isError } = useQuery({
    queryKey: ['travel-mode-top3-all'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_mode_top3')
        .select('id, item_name, location, area, price, description, emoji, image_url, category, sort_order, park_id, park_name, restaurant_id, restaurants!restaurant_id(latitude, longitude, slug)')
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

  const availableParks = PARKS.filter(p =>
    TOP3_PARK_IDS.includes(p.id) && allItems.some(i => i.park_id === p.id)
  );

  const selectedPark = selectedParkId ? availableParks.find(p => p.id === selectedParkId) : null;

  const itemsByCategory = useCallback((parkId: string, cat: Top3Category) =>
    allItems.filter(i => i.park_id === parkId && i.category === cat),
  [allItems]);

  const filteredItems = selectedPark ? itemsByCategory(selectedPark.id, activeCategory) : [];

  const categoryCounts = selectedPark
    ? (Object.keys(CATEGORIES) as Top3Category[]).reduce<Record<string, number>>((acc, cat) => {
        acc[cat] = itemsByCategory(selectedPark.id, cat).length;
        return acc;
      }, {})
    : {};

  const handleNavigateToMap = useCallback((item: Top3Row) => {
    // Open inline map preview sheet — no navigation away from the page
    setMapPreviewItem(item);
  }, []);

  const handleOpenFullMap = useCallback((item: Top3Row) => {
    const params = new URLSearchParams({ park: item.park_id });
    if (item.restaurant_id) params.set('restaurant_id', item.restaurant_id);
    if (item.restaurant_latitude && item.restaurant_longitude) {
      params.set('lat', String(item.restaurant_latitude));
      params.set('lng', String(item.restaurant_longitude));
    }
    params.set('search', item.location);
    navigate(`/mapa?${params.toString()}`);
  }, [navigate]);

  const handleRouteInApp = useCallback((item: Top3Row) => {
    // Navigate to map and trigger route calculation to this POI
    const params = new URLSearchParams({ park: item.park_id });
    if (item.restaurant_id) params.set('restaurant_id', item.restaurant_id);
    if (item.restaurant_latitude && item.restaurant_longitude) {
      params.set('lat', String(item.restaurant_latitude));
      params.set('lng', String(item.restaurant_longitude));
      params.set('navigate', '1'); // signal map to start route immediately
    }
    params.set('search', item.location);
    navigate(`/mapa?${params.toString()}`);
  }, [navigate]);

  const parkImg = selectedPark ? parkImages[selectedPark.id] : null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">

        {/* ─── Sticky header ─── */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => selectedParkId ? setSelectedParkId(null) : navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-foreground leading-tight truncate">
                  {selectedPark ? selectedPark.name : 'Top 3 nos Parques'}
                </h1>
                {selectedPark && (
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Melhores experiências gastronômicas
                  </p>
                )}
              </div>
            </div>
            {selectedPark && (
              <Badge variant="outline" className="shrink-0 text-[10px] gap-1 text-amber-500 border-amber-500/30 bg-amber-500/5">
                <Flame className="w-3 h-3" />
                Top Picks
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-4">

          {/* ─── PARK SELECTION VIEW ─── */}
          {!selectedPark ? (
            <div className="space-y-4">
              {/* Intro banner */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">🏆</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Curadoria gastronômica</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Os melhores doces, restaurantes e snacks de cada parque, selecionados pelos nossos guias.
                  </p>
                </div>
              </div>

              {/* Stats row */}
              {!isLoading && allItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORIES) as Top3Category[]).map(cat => {
                    const meta = CATEGORIES[cat];
                    const count = allItems.filter(i => i.category === cat).length;
                    return (
                      <div key={cat} className={`rounded-xl border p-2.5 text-center ${meta.bg}`}>
                        <p className="text-lg">{meta.emoji}</p>
                        <p className="text-xs font-bold mt-0.5">{count}</p>
                        <p className="text-[10px] opacity-70">{meta.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center font-medium">
                Escolha um parque para explorar
              </p>

              {/* Park grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <ParkCardSkeleton key={i} />)}
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Erro ao carregar recomendações.</p>
                  <p className="text-xs mt-1">Tente recarregar a página.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {availableParks.map((park, idx) => {
                    const img = parkImages[park.id];
                    const count = allItems.filter(i => i.park_id === park.id).length;
                    return (
                      <motion.button
                        key={park.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedParkId(park.id);
                          // Default to the category with most items
                          const best = (Object.keys(CATEGORIES) as Top3Category[]).reduce((a, b) =>
                            allItems.filter(i => i.park_id === park.id && i.category === b).length >
                            allItems.filter(i => i.park_id === park.id && i.category === a).length ? b : a
                          );
                          setActiveCategory(best);
                        }}
                        className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group h-40 text-left"
                      >
                        {img ? (
                          <img src={img} alt={park.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Item count badge */}
                        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white">{count}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-sm font-bold text-white leading-tight">{park.name}</h3>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {(Object.keys(CATEGORIES) as Top3Category[]).map(cat => {
                              const n = allItems.filter(i => i.park_id === park.id && i.category === cat).length;
                              if (!n) return null;
                              return (
                                <span key={cat} className="text-[9px] bg-white/20 backdrop-blur-sm text-white rounded-full px-1.5 py-0.5">
                                  {CATEGORIES[cat].emoji} {n}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <ChevronRight className="absolute top-1/2 right-2.5 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

          ) : (

            /* ─── PARK DETAIL VIEW ─── */
            <div className="space-y-4 pb-4">

              {/* Park hero */}
              <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
                {parkImg && (
                  <img src={parkImg} alt={selectedPark.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Parque selecionado</p>
                    <h2 className="text-lg font-black text-white leading-tight">{selectedPark.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedParkId(null)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">Trocar</span>
                  </button>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2">
                {(Object.keys(CATEGORIES) as Top3Category[]).map((cat) => {
                  const meta = CATEGORIES[cat];
                  const count = categoryCounts[cat] ?? 0;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${meta.gradient} text-white shadow-md scale-[1.02]`
                          : 'bg-muted text-muted-foreground hover:bg-muted/60'
                      }`}
                    >
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-[10px] leading-none">{meta.label}</span>
                      {count > 0 && (
                        <span className={`text-[9px] font-bold ${isActive ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                          {count} itens
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Items */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedPark.id}-${activeCategory}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <ItemCardSkeleton key={i} />)
                  ) : filteredItems.length > 0 ? (
                    <>
                      {filteredItems.map((item, index) => (
                        <Top3ItemCard
                          key={item.id}
                          item={item}
                          index={index}
                          onNavigate={handleNavigateToMap}
                          onRoute={handleRouteInApp}
                        />
                      ))}

                      {/* Tip */}
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Toque em <strong className="text-foreground">Ver no mapa</strong> para localizar ou{' '}
                          <strong className="text-foreground">Ir até lá</strong> para navegar diretamente pelo app.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-3 text-center">
                      <span className="text-4xl">{CATEGORIES[activeCategory].emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Em breve</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ainda não temos recomendações de {CATEGORIES[activeCategory].label.toLowerCase()} para este parque.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      {/* ─── Inline map preview sheet ─── */}
      <Sheet open={!!mapPreviewItem} onOpenChange={(open) => { if (!open) setMapPreviewItem(null); }}>
        <SheetContent side="bottom" className="p-0 rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {mapPreviewItem && (() => {
            const item = mapPreviewItem;
            const hasCoords = !!(item.restaurant_latitude && item.restaurant_longitude);
            const rank = RANK_STYLES[
              (selectedPark
                ? allItems.filter(i => i.park_id === item.park_id && i.category === item.category)
                : allItems
              ).findIndex(i => i.id === item.id)
            ] ?? RANK_STYLES[0];

            const lat = item.restaurant_latitude;
            const lng = item.restaurant_longitude;
            const catColor = CATEGORIES[item.category as Top3Category]?.gradient.includes('pink') ? '#EC4899'
              : CATEGORIES[item.category as Top3Category]?.gradient.includes('orange') ? '#F97316'
              : '#10B981';

            return (
              <div>
                {/* Interactive Google Map */}
                <div className="relative h-56 bg-muted overflow-hidden">
                  {hasCoords ? (
                    <MiniMap lat={lat!} lng={lng!} color={catColor} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="w-8 h-8" />
                      <p className="text-xs">Coordenadas não disponíveis</p>
                    </div>
                  )}
                  {/* Close button */}
                  <button
                    onClick={() => setMapPreviewItem(null)}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Rank medal overlay */}
                  <div className={`absolute top-3 left-3 bg-gradient-to-br ${rank.bg} rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg`}>
                    <span className="text-sm">{rank.medal}</span>
                    <span className="text-xs font-bold text-white">{item.item_name}</span>
                  </div>
                </div>

                {/* Item details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{item.item_name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="font-medium text-foreground/80">{item.location}</span>
                      {item.area && <><span className="text-muted-foreground/40">•</span><span>{item.area}</span></>}
                    </div>
                  </div>

                  {item.price && (
                    <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-500/30 bg-green-500/5">
                      <DollarSign className="w-3 h-3" />{item.price}
                    </Badge>
                  )}

                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      className="gap-2 h-11 bg-primary hover:bg-primary/90"
                      onClick={() => { setMapPreviewItem(null); handleRouteInApp(item); }}
                      disabled={!hasCoords}
                    >
                      <Navigation className="w-4 h-4" />
                      Navegar
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 h-11"
                      onClick={() => { setMapPreviewItem(null); handleOpenFullMap(item); }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir mapa
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Top3Page;
