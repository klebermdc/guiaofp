import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, hotels, regionLabels, categoryLabels, HotelRegion, HotelCategory } from '@/data/hotelsData';
import { HotelCard } from '@/components/hotels/HotelCard';
import { HotelCompareDrawer } from '@/components/hotels/HotelCompareDrawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { Search, SlidersHorizontal, X, GitCompareArrows, AlertTriangle, Hotel as HotelIcon, ChevronUp } from 'lucide-react';


type SortOption = 'price-asc' | 'price-desc' | 'stars' | 'name';

const sortLabels: Record<SortOption, string> = {
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  stars: 'Mais estrelas',
  name: 'Nome A-Z',
};

const HotelComparator = () => {
  
  const [search, setSearch] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<HotelRegion[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<HotelCategory[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([50, 1600]);
  const [minStars, setMinStars] = useState(0);
  const [sort, setSort] = useState<SortOption>('price-asc');
  const [showFilters, setShowFilters] = useState(false);

  // Amenity filters
  const [onlyShuttle, setOnlyShuttle] = useState(false);
  const [onlyFreeParking, setOnlyFreeParking] = useState(false);
  const [onlyPool, setOnlyPool] = useState(false);
  const [onlyPet, setOnlyPet] = useState(false);
  const [onlyOnSite, setOnlyOnSite] = useState(false);

  // Compare
  const [compareList, setCompareList] = useState<Hotel[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleRegion = (r: HotelRegion) =>
    setSelectedRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const toggleCategory = (c: HotelCategory) =>
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleCompare = (hotel: Hotel) => {
    setCompareList((prev) =>
      prev.find((h) => h.id === hotel.id)
        ? prev.filter((h) => h.id !== hotel.id)
        : prev.length < 3 ? [...prev, hotel] : prev
    );
  };

  const filtered = useMemo(() => {
    const result = hotels.filter((h) => {
      const q = search.toLowerCase();
      if (q && !h.name.toLowerCase().includes(q) && !h.chain.toLowerCase().includes(q) && !h.description.toLowerCase().includes(q)) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(h.region)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(h.category)) return false;
      if (h.priceEstimate.avg < priceRange[0] || h.priceEstimate.avg > priceRange[1]) return false;
      if (h.stars < minStars) return false;
      if (onlyShuttle && !h.amenities.shuttle) return false;
      if (onlyFreeParking && !h.amenities.freeParking) return false;
      if (onlyPool && !h.amenities.pool) return false;
      if (onlyPet && !h.amenities.petFriendly) return false;
      if (onlyOnSite && !h.isOnSite) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.priceEstimate.avg - b.priceEstimate.avg;
        case 'price-desc': return b.priceEstimate.avg - a.priceEstimate.avg;
        case 'stars': return b.stars - a.stars;
        case 'name': return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [search, selectedRegions, selectedCategories, priceRange, minStars, sort, onlyShuttle, onlyFreeParking, onlyPool, onlyPet, onlyOnSite]);

  const activeFilterCount = [
    selectedRegions.length > 0,
    selectedCategories.length > 0,
    priceRange[0] !== 50 || priceRange[1] !== 1600,
    minStars > 0,
    onlyShuttle, onlyFreeParking, onlyPool, onlyPet, onlyOnSite,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedRegions([]);
    setSelectedCategories([]);
    setPriceRange([50, 1600]);
    setMinStars(0);
    setOnlyShuttle(false);
    setOnlyFreeParking(false);
    setOnlyPool(false);
    setOnlyPet(false);
    setOnlyOnSite(false);
    setSearch('');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <HotelIcon className="w-6 h-6 text-primary" />
            Comparador de Hotéis
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare {hotels.length}+ hotéis em Orlando e encontre o ideal para sua viagem
          </p>
        </div>

        {/* Estimate Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-yellow-300/50 bg-yellow-50/50 dark:bg-yellow-950/10 dark:border-yellow-500/20 p-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
            <strong>Preços estimados:</strong> Os valores exibidos são estimativas baseadas em pesquisa de mercado 2024/2025.
            Podem variar conforme temporada, promoções e disponibilidade. Confirme o preço real antes de reservar.
          </p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar hotel, rede ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-40 hidden sm:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                {/* Regions */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">📍 Região</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(regionLabels) as HotelRegion[]).map((r) => (
                      <Badge
                        key={r}
                        variant={selectedRegions.includes(r) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleRegion(r)}
                      >
                        {regionLabels[r]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">⭐ Categoria</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(categoryLabels) as HotelCategory[]).map((c) => (
                      <Badge
                        key={c}
                        variant={selectedCategories.includes(c) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleCategory(c)}
                      >
                        {categoryLabels[c]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    💰 Preço médio: US$ {priceRange[0]} – US$ {priceRange[1]}
                  </p>
                  <Slider
                    min={50}
                    max={1600}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>

                {/* Stars */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">⭐ Mín. estrelas: {minStars || 'Todas'}</p>
                  <div className="flex gap-1.5">
                    {[0, 3, 3.5, 4, 4.5, 5].map((s) => (
                      <Badge
                        key={s}
                        variant={minStars === s ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => setMinStars(s)}
                      >
                        {s === 0 ? 'Todas' : `${s}+`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Amenity Toggles */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">🏷️ Amenidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '🚌 Shuttle', value: onlyShuttle, set: setOnlyShuttle },
                      { label: '🚗 Estac. grátis', value: onlyFreeParking, set: setOnlyFreeParking },
                      { label: '🏊 Piscina', value: onlyPool, set: setOnlyPool },
                      { label: '🐾 Pet Friendly', value: onlyPet, set: setOnlyPet },
                      { label: '🏰 On-Site', value: onlyOnSite, set: setOnlyOnSite },
                    ].map((a) => (
                      <Badge
                        key={a.label}
                        variant={a.value ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => a.set(!a.value)}
                      >
                        {a.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                    <X className="w-3 h-3" /> Limpar filtros
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'hotel encontrado' : 'hotéis encontrados'}
        </p>

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isSelected={!!compareList.find((h) => h.id === hotel.id)}
              canSelect={compareList.length < 3}
              onToggleCompare={toggleCompare}
              
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <HotelIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum hotel encontrado com esses filtros.</p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">Limpar filtros</Button>
          </div>
        )}

        {/* Compare FAB */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-20 left-0 right-0 z-40 px-4 flex justify-center"
            >
              <div className="bg-card border border-border shadow-glow rounded-2xl p-3 flex items-center gap-3 max-w-md w-full">
                <div className="flex -space-x-2">
                  {compareList.map((h) => (
                    <img key={h.id} src={h.imageUrl} alt={h.name} className="w-10 h-10 rounded-full border-2 border-background object-cover" />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{compareList.length}/3 selecionados</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {compareList.map((h) => h.name.split(' ').slice(0, 2).join(' ')).join(', ')}
                  </p>
                </div>
                <Button size="sm" onClick={() => setDrawerOpen(true)} className="gap-1.5" disabled={compareList.length < 2}>
                  <GitCompareArrows className="w-4 h-4" />
                  Comparar
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setCompareList([])}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <HotelCompareDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          hotels={compareList}
          onRemove={(id) => setCompareList((prev) => prev.filter((h) => h.id !== id))}
        />
      </div>
    </AppLayout>
  );
};

export default HotelComparator;
