import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, GripVertical, Clock, MapPin, Loader2, UtensilsCrossed, ExternalLink, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
}

interface ActivityLibraryProps {
  onDragStart?: (item: LibraryItem) => void;
}

// Tab configuration
const TABS = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'attractions', label: 'Atrações', icon: '🎢' },
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

// Fetch functions
const fetchParks = async () => {
  const { data, error } = await supabase
    .from('parks')
    .select('id, name, slug, color, typical_visit_duration')
    .order('name');
  if (error) throw error;
  return data;
};

const fetchAttractions = async () => {
  const { data, error } = await supabase
    .from('attractions')
    .select('id, name, icon, duration, area, park_id, parks(name, slug, color)')
    .order('name');
  if (error) throw error;
  return data;
};

const fetchRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, color, area, park_id, cuisine, description, menu_url, must_try, tips, type, parks(name, slug, color)')
    .order('name');
  if (error) throw error;
  return data;
};

const fetchShopping = async () => {
  const { data, error } = await supabase
    .from('shopping')
    .select('id, name, color, category, average_visit_duration')
    .order('name');
  if (error) throw error;
  return data;
};

const fetchActivities = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('id, name, color, category, duration')
    .order('name');
  if (error) throw error;
  return data;
};

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

export const ActivityLibrary = ({ onDragStart }: ActivityLibraryProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPark, setSelectedPark] = useState<string>('all');

  // Fetch data
  const { data: parks = [], isLoading: loadingParks } = useQuery({ 
    queryKey: ['parks'], 
    queryFn: fetchParks,
    staleTime: 5 * 60 * 1000,
  });
  const { data: attractions = [], isLoading: loadingAttractions } = useQuery({ 
    queryKey: ['attractions'], 
    queryFn: fetchAttractions,
    staleTime: 5 * 60 * 1000,
  });
  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({ 
    queryKey: ['restaurants'], 
    queryFn: fetchRestaurants,
    staleTime: 5 * 60 * 1000,
  });
  const { data: shopping = [], isLoading: loadingShopping } = useQuery({ 
    queryKey: ['shopping'], 
    queryFn: fetchShopping,
    staleTime: 5 * 60 * 1000,
  });
  const { data: activities = [], isLoading: loadingActivities } = useQuery({ 
    queryKey: ['activities'], 
    queryFn: fetchActivities,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingParks || loadingAttractions || loadingRestaurants || loadingShopping || loadingActivities;

  // Transform data to LibraryItem format
  const transformedItems = useMemo(() => {
    const attractionItems: LibraryItem[] = attractions.map(attr => {
      const info = getCategoryInfo(attr, 'attraction', parks);
      return {
        id: attr.id,
        name: attr.name,
        type: 'attraction' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(attr, 'attraction'),
        duration: attr.duration || undefined,
        area: attr.area || undefined,
        park_id: attr.park_id || undefined,
        parkName: info.parkName,
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
      };
    });

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
      attractions: attractionItems,
      restaurants: restaurantItems,
      shopping: shoppingItems,
      activities: activityItems,
    };
  }, [parks, attractions, restaurants, shopping, activities]);

  // Filter items based on tab, search, and park
  const filteredItems = useMemo(() => {
    let items: LibraryItem[] = [];

    switch (selectedTab) {
      case 'attractions':
        items = transformedItems.attractions;
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
          ...transformedItems.attractions,
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

    // Filter by park (only for attractions tab)
    if (selectedTab === 'attractions' && selectedPark && selectedPark !== 'all') {
      items = items.filter(item => item.park_id === selectedPark);
    }

    return items;
  }, [selectedTab, searchQuery, selectedPark, transformedItems]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: transformedItems.attractions.length + transformedItems.restaurants.length + 
         transformedItems.shopping.length + transformedItems.activities.length,
    attractions: transformedItems.attractions.length,
    restaurants: transformedItems.restaurants.length,
    shopping: transformedItems.shopping.length,
    activities: transformedItems.activities.length + transformedItems.shopping.length,
  }), [transformedItems]);

  const showParkFilter = selectedTab === 'attractions';

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
          <TabsList className="w-full h-auto p-1 bg-muted/50 grid grid-cols-5 gap-1">
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

      {/* Park Filter (only for attractions) */}
      {showParkFilter && (
        <div className="px-3 py-2 border-b border-border bg-blue-50/50">
          <Select value={selectedPark} onValueChange={setSelectedPark}>
            <SelectTrigger className="w-full h-8 text-xs bg-white">
              <SelectValue placeholder="Filtrar por parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🏰 Todos os Parques</SelectItem>
              {parks.map(park => (
                <SelectItem key={park.id} value={park.id}>
                  {park.slug?.includes('disney') ? '🏰' : '⚡'} {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
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
              </div>
            ) : (
              filteredItems.map(item => (
                <DraggableActivityItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onDragStart={onDragStart}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

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
