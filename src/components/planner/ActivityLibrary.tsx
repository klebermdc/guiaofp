import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, GripVertical, Clock, MapPin, Loader2, UtensilsCrossed, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRestaurantFavorites } from '@/hooks/useRestaurantFavorites';
import { fetchLibraryDataParallel } from '@/hooks/useCachedQueries';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonCard } from '@/components/ui/skeleton-card';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity';
  category: string;
  color: string;
  icon: string;
  duration?: number;
  area?: string;
  park_id?: string;
  parkName?: string;
  description?: string;
  menuUrl?: string;
  cuisine?: string;
  mustTry?: string;
  tip?: string;
  restaurantType?: string;
  isFavorite?: boolean;
}

interface ActivityLibraryProps {
  onDragStart?: (item: LibraryItem) => void;
}

// Tab configuration
const TABS = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'favorites', label: 'Favoritos', icon: '❤️' },
  { id: 'parks', label: 'Parques', icon: '🏰' },
  { id: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  { id: 'shopping', label: 'Compras', icon: '🛍️' },
  { id: 'activities', label: 'Outras', icon: '🌴' },
] as const;

// Category color mapping - using darker colors for dark theme
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  disney: { bg: 'bg-blue-950/50', text: 'text-blue-300', border: 'border-blue-700' },
  universal: { bg: 'bg-purple-950/50', text: 'text-purple-300', border: 'border-purple-700' },
  seaworld: { bg: 'bg-cyan-950/50', text: 'text-cyan-300', border: 'border-cyan-700' },
  outlet: { bg: 'bg-rose-950/50', text: 'text-rose-300', border: 'border-rose-700' },
  mall: { bg: 'bg-pink-950/50', text: 'text-pink-300', border: 'border-pink-700' },
  supermarket: { bg: 'bg-green-950/50', text: 'text-green-300', border: 'border-green-700' },
  restaurante: { bg: 'bg-orange-950/50', text: 'text-orange-300', border: 'border-orange-700' },
  atividade: { bg: 'bg-teal-950/50', text: 'text-teal-300', border: 'border-teal-700' },
};

const getCategoryStyle = (category: string) => {
  return CATEGORY_STYLES[category.toLowerCase()] || { bg: 'bg-muted/50', text: 'text-foreground', border: 'border-border' };
};

// Removed individual fetch functions - now using fetchLibraryDataParallel from useCachedQueries

// Helper to determine category info
const getCategoryInfo = (item: any, type: string, parks: any[]) => {
  if (type === 'park') {
    const isDisney = item.slug?.includes('disney') || item.slug?.includes('magic-kingdom') || 
                     item.slug?.includes('epcot') || item.slug?.includes('hollywood') || 
                     item.slug?.includes('animal-kingdom');
    return {
      category: isDisney ? 'disney' : 'universal',
      color: item.color || (isDisney ? '#1E40AF' : '#7C3AED'),
    };
  }

  if (item.park_id && parks) {
    const park = parks.find(p => p.id === item.park_id);
    if (park) {
      const isDisney = park.slug?.includes('disney') || park.slug?.includes('magic-kingdom') || 
                       park.slug?.includes('epcot') || park.slug?.includes('hollywood') || 
                       park.slug?.includes('animal-kingdom');
      return {
        category: isDisney ? 'disney' : 'universal',
        color: park.color || (isDisney ? '#1E40AF' : '#7C3AED'),
        parkName: park.name,
      };
    }
  }

  if (type === 'shopping') {
    if (item.category === 'outlet') return { category: 'outlet', color: '#A855F7' };
    if (item.category === 'walmart' || item.category === 'supermercado') return { category: 'supermarket', color: '#0066CC' };
    if (item.category === 'target') return { category: 'supermarket', color: '#CC0000' };
    if (item.category === 'mall') return { category: 'mall', color: '#EC4899' };
    return { category: 'shopping', color: item.color || '#10B981' };
  }

  if (type === 'activity') {
    return { category: 'atividade', color: item.color || '#14B8A6' };
  }

  if (type === 'restaurant') {
    return { category: 'restaurante', color: item.color || '#F97316' };
  }

  return { category: 'outro', color: '#6B7280' };
};

// Get icon for item type
const getItemIcon = (item: any, type: string) => {
  if (item.icon) return item.icon;
  
  switch (type) {
    case 'park': return '🏰';
    case 'attraction': return '🎢';
    case 'restaurant': return '🍽️';
    case 'shopping': {
      if (item.category === 'outlet') return '🛍️';
      if (item.category === 'walmart' || item.category === 'supermercado') return '🛒';
      if (item.category === 'mall') return '🏬';
      return '🛒';
    }
    case 'activity': return '🌴';
    default: return '📍';
  }
};

// Restaurant type configuration
const RESTAURANT_TYPES = [
  { id: 'all', label: 'Todos', icon: '🍽️' },
  { id: 'quick-service', label: 'Quick Service', icon: '🍔' },
  { id: 'table-service', label: 'Mesa', icon: '🍷' },
  { id: 'signature', label: 'Signature', icon: '⭐' },
] as const;
// Paginated items list with infinite scroll and skeletons
const ActivityItemsList = ({
  isLoading,
  filteredItems,
  selectedTab,
  searchQuery,
  setSearchQuery,
  onDragStart,
}: {
  isLoading: boolean;
  filteredItems: LibraryItem[];
  selectedTab: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onDragStart?: (item: LibraryItem) => void;
}) => {
  // Determine page size based on item type
  const pageSize = selectedTab === 'restaurants' ? 20 : 30;

  const { visibleItems, loadMoreRef, hasMore, totalCount, visibleCount } = useInfiniteScroll({
    items: filteredItems,
    pageSize,
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-3">
          <SkeletonCard count={6} variant="compact" className="grid-cols-1" />
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-3">
          <div className="text-center py-12">
            {selectedTab === 'favorites' && !searchQuery ? (
              <>
                <Heart className="h-10 w-10 mx-auto mb-3 text-rose-400/50" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Nenhum favorito ainda
                </p>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                  Adicione restaurantes aos favoritos no Guia de Restaurantes para vê-los aqui
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl mb-2 block">🔍</span>
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Limpar busca
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="p-3 space-y-2 pb-6">
        {/* Show favorites header when on favorites tab */}
        {selectedTab === 'favorites' && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-medium text-foreground">
              Seus restaurantes favoritos ({filteredItems.length})
            </span>
          </div>
        )}
        {visibleItems.map(item => (
          <DraggableActivityItem
            key={`${item.type}-${item.id}`}
            item={item}
            onDragStart={onDragStart}
          />
        ))}
        
        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground ml-2">
              {visibleCount} de {totalCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


export const ActivityLibrary = ({ onDragStart }: ActivityLibraryProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurantType, setSelectedRestaurantType] = useState<string>('all');

  // Fetch all library data in a single parallel query
  const { data: libraryData, isLoading: loadingLibrary } = useQuery({
    queryKey: ['library-data'],
    queryFn: fetchLibraryDataParallel,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - static data
  });

  const parks = libraryData?.parks || [];
  const restaurants = libraryData?.restaurants || [];
  const shopping = libraryData?.shopping || [];
  const activities = libraryData?.activities || [];

  // Fetch user favorites
  const { data: favoriteRestaurants = [], isLoading: loadingFavorites } = useRestaurantFavorites();

  const isLoading = loadingLibrary || loadingFavorites;

  // Transform data to LibraryItem format
  const transformedItems = useMemo(() => {
    // Parks as draggable items
    const parkItems: LibraryItem[] = parks.map(park => {
      const info = getCategoryInfo(park, 'park', parks);
      return {
        id: park.id,
        name: park.name,
        type: 'park' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(park, 'park'),
        duration: park.typical_visit_duration || undefined,
      };
    });

    const restaurantItems: LibraryItem[] = restaurants.map(rest => {
      const info = getCategoryInfo(rest, 'restaurant', parks);
      // Build a short description from available data
      let shortDesc = rest.description || '';
      if (!shortDesc && rest.cuisine) {
        shortDesc = `Culinária ${rest.cuisine}`;
      }
      if (!shortDesc && rest.type) {
        const typeLabels: Record<string, string> = {
          'quick-service': 'Restaurante Quick Service',
          'table-service': 'Restaurante com serviço de mesa',
          'signature': 'Restaurante Signature (premium)',
        };
        shortDesc = typeLabels[rest.type] || 'Restaurante';
      }
      
      return {
        id: rest.id,
        name: rest.name,
        type: 'restaurant' as const,
        category: info.category || 'restaurante',
        color: info.color,
        icon: getItemIcon(rest, 'restaurant'),
        area: rest.area || undefined,
        park_id: rest.park_id || undefined,
        parkName: info.parkName,
        description: shortDesc || undefined,
        menuUrl: rest.menu_url || undefined,
        cuisine: rest.cuisine || undefined,
        mustTry: rest.must_try || undefined,
        tip: rest.tips || undefined,
        restaurantType: rest.type || undefined,
      };
    });

    // Transform favorite restaurants
    const favoriteItems: LibraryItem[] = favoriteRestaurants.map((fav: any) => {
      const rest = fav.restaurants;
      if (!rest) return null;
      
      const info = getCategoryInfo(rest, 'restaurant', parks);
      let shortDesc = rest.description || '';
      if (!shortDesc && rest.cuisine) {
        shortDesc = `Culinária ${rest.cuisine}`;
      }
      
      return {
        id: rest.id,
        name: rest.name,
        type: 'restaurant' as const,
        category: info.category || 'restaurante',
        color: info.color,
        icon: '❤️', // Heart icon for favorites
        area: rest.area || undefined,
        park_id: rest.park_id || undefined,
        parkName: info.parkName,
        description: shortDesc || undefined,
        menuUrl: rest.menu_url || undefined,
        cuisine: rest.cuisine || undefined,
        mustTry: rest.must_try || undefined,
        tip: rest.tips || undefined,
        restaurantType: rest.type || undefined,
        isFavorite: true,
      };
    }).filter(Boolean) as LibraryItem[];

    const shoppingItems: LibraryItem[] = shopping.map(shop => {
      const info = getCategoryInfo(shop, 'shopping', parks);
      return {
        id: shop.id,
        name: shop.name,
        type: 'shopping' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(shop, 'shopping'),
        duration: shop.average_visit_duration || undefined,
      };
    });

    const activityItems: LibraryItem[] = activities.map(act => {
      const info = getCategoryInfo(act, 'activity', parks);
      return {
        id: act.id,
        name: act.name,
        type: 'activity' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(act, 'activity'),
        duration: act.duration || undefined,
      };
    });

    return {
      parks: parkItems,
      restaurants: restaurantItems,
      favorites: favoriteItems,
      shopping: shoppingItems,
      activities: activityItems,
    };
  }, [parks, restaurants, shopping, activities, favoriteRestaurants]);

  // Filter items based on tab, search, and park
  const filteredItems = useMemo(() => {
    let items: LibraryItem[] = [];

    switch (selectedTab) {
      case 'favorites':
        items = transformedItems.favorites;
        break;
      case 'parks':
        items = transformedItems.parks;
        break;
      case 'restaurants':
        items = transformedItems.restaurants;
        break;
      case 'shopping':
        items = transformedItems.shopping;
        break;
      case 'activities':
        items = [...transformedItems.activities, ...transformedItems.shopping];
        break;
      case 'all':
      default:
        items = [
          ...transformedItems.parks,
          ...transformedItems.restaurants,
          ...transformedItems.shopping,
          ...transformedItems.activities,
        ];
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.parkName?.toLowerCase().includes(query) ||
        item.area?.toLowerCase().includes(query)
      );
    }

    // Filter by restaurant type (only for restaurants tab)
    if (selectedTab === 'restaurants' && selectedRestaurantType && selectedRestaurantType !== 'all') {
      items = items.filter(item => item.restaurantType === selectedRestaurantType);
    }

    return items;
  }, [selectedTab, searchQuery, selectedRestaurantType, transformedItems]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: transformedItems.parks.length + transformedItems.restaurants.length + 
         transformedItems.shopping.length + transformedItems.activities.length,
    favorites: transformedItems.favorites.length,
    parks: transformedItems.parks.length,
    restaurants: transformedItems.restaurants.length,
    shopping: transformedItems.shopping.length,
    activities: transformedItems.activities.length + transformedItems.shopping.length,
  }), [transformedItems]);

  const showRestaurantTypeFilter = selectedTab === 'restaurants';

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm sticky top-4 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <span className="text-lg">📚</span>
          Biblioteca de Atividades
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, área..."
            className="pl-9 h-9 text-sm bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3 py-2 border-b border-border bg-muted/20">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full h-auto p-1 bg-muted/50 grid grid-cols-6 gap-0.5">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <span className="text-base">{tab.icon}</span>
                <span className="leading-none truncate w-full text-center">{tab.label}</span>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 min-w-[20px]">
                  {tabCounts[tab.id as keyof typeof tabCounts]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Restaurant Type Filter (only for restaurants) */}
      {showRestaurantTypeFilter && (
        <div className="px-3 py-2 border-b border-border bg-orange-50/50 dark:bg-orange-950/20">
          <div className="flex flex-wrap gap-1.5">
            {RESTAURANT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedRestaurantType(type.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                  selectedRestaurantType === type.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <ActivityItemsList
        isLoading={isLoading}
        filteredItems={filteredItems}
        selectedTab={selectedTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onDragStart={onDragStart}
      />

      {/* Footer Tip */}
      <div className="p-3 border-t border-border bg-gradient-to-t from-muted/30 to-transparent">
        <p className="text-[11px] text-muted-foreground text-center">
          <span className="font-medium">💡 Dica:</span> Arraste itens para os slots do calendário
        </p>
      </div>
    </div>
  );
};

// Draggable Activity Item Component
interface DraggableActivityItemProps {
  item: LibraryItem;
  onDragStart?: (item: LibraryItem) => void;
}

const DraggableActivityItem = ({ item, onDragStart }: DraggableActivityItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${item.type}-${item.id}`,
    data: item,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const categoryStyle = getCategoryStyle(item.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2.5 border rounded-lg cursor-grab active:cursor-grabbing transition-all touch-none group",
        "bg-card hover:shadow-md hover:border-primary/30",
        isDragging && "shadow-xl scale-105 opacity-80 ring-2 ring-primary z-50",
        categoryStyle.border
      )}
      onDragStart={() => onDragStart?.(item)}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div className="mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {/* Icon */}
        <span className="text-lg flex-shrink-0">{item.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {item.name}
          </p>
          
          {/* Location/Area */}
          {(item.area || item.parkName) && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground truncate">
                {item.area || item.parkName}
              </p>
            </div>
          )}

          {/* Duration */}
          {item.duration && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {item.duration} min
              </p>
            </div>
          )}

          {/* Restaurant-specific info */}
          {item.type === 'restaurant' && (
            <div className="mt-1.5 space-y-1">
              {/* Cuisine type */}
              {item.cuisine && (
                <div className="flex items-center gap-1">
                  <UtensilsCrossed className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                  <p className="text-[10px] text-orange-400 font-medium truncate">
                    {item.cuisine}
                  </p>
                </div>
              )}
              
              {/* Description */}
              {item.description && (
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              
              {/* Must try */}
              {item.mustTry && (
                <div className="flex items-start gap-1 bg-amber-500/10 rounded px-1.5 py-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500 line-clamp-1">
                    <span className="font-medium">Peça:</span> {item.mustTry}
                  </p>
                </div>
              )}
              
              {/* Menu link */}
              {item.menuUrl && (
                <a
                  href={item.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  Ver cardápio
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Category Tag */}
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide",
            categoryStyle.bg,
            categoryStyle.text
          )}
        >
          {item.category}
        </span>
        {item.type === 'attraction' && item.parkName && (
          <span className="text-[9px] text-muted-foreground truncate">
            {item.parkName}
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityLibrary;
