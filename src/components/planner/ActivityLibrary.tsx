import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

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
}

interface ActivityLibraryProps {
  onDragStart?: (item: LibraryItem) => void;
}

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
    .select('id, name, color, area, park_id, cuisine, parks(name, slug, color)')
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

// Helper to get category and color
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
    if (item.category === 'walmart' || item.category === 'supermercado') return { category: 'walmart', color: '#0066CC' };
    if (item.category === 'target') return { category: 'target', color: '#CC0000' };
    return { category: 'shopping', color: item.color || '#10B981' };
  }

  if (type === 'activity') {
    return { category: item.category || 'atividade', color: item.color || '#F59E0B' };
  }

  if (type === 'restaurant') {
    return { category: 'restaurante', color: item.color || '#EF4444' };
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
      return '🏬';
    }
    case 'activity': return '🌴';
    default: return '📍';
  }
};

export const ActivityLibrary = ({ onDragStart }: ActivityLibraryProps) => {
  const [selectedTab, setSelectedTab] = useState('parks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPark, setSelectedPark] = useState<string>('all');

  // Fetch data
  const { data: parks = [] } = useQuery({ queryKey: ['parks'], queryFn: fetchParks });
  const { data: attractions = [] } = useQuery({ queryKey: ['attractions'], queryFn: fetchAttractions });
  const { data: restaurants = [] } = useQuery({ queryKey: ['restaurants'], queryFn: fetchRestaurants });
  const { data: shopping = [] } = useQuery({ queryKey: ['shopping'], queryFn: fetchShopping });
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: fetchActivities });

  // Transform data to LibraryItem format
  const transformedItems = useMemo(() => {
    const parkItems: LibraryItem[] = parks.map(park => {
      const info = getCategoryInfo(park, 'park', parks);
      return {
        id: park.id,
        name: park.name,
        type: 'park' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(park, 'park'),
        duration: park.typical_visit_duration,
      };
    });

    const attractionItems: LibraryItem[] = attractions.map(attr => {
      const info = getCategoryInfo(attr, 'attraction', parks);
      return {
        id: attr.id,
        name: attr.name,
        type: 'attraction' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(attr, 'attraction'),
        duration: attr.duration,
        area: attr.area || undefined,
        park_id: attr.park_id || undefined,
        parkName: info.parkName,
      };
    });

    const restaurantItems: LibraryItem[] = restaurants.map(rest => {
      const info = getCategoryInfo(rest, 'restaurant', parks);
      return {
        id: rest.id,
        name: rest.name,
        type: 'restaurant' as const,
        category: info.category,
        color: info.color,
        icon: getItemIcon(rest, 'restaurant'),
        area: rest.area || undefined,
        park_id: rest.park_id || undefined,
        parkName: info.parkName,
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
      parks: parkItems,
      attractions: attractionItems,
      restaurants: restaurantItems,
      shopping: shoppingItems,
      activities: activityItems,
    };
  }, [parks, attractions, restaurants, shopping, activities]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items: LibraryItem[] = [];

    switch (selectedTab) {
      case 'parks':
        items = transformedItems.parks;
        break;
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
        items = transformedItems.activities;
        break;
      case 'all':
        items = [
          ...transformedItems.attractions,
          ...transformedItems.restaurants,
          ...transformedItems.shopping,
          ...transformedItems.activities,
        ];
        break;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.parkName?.toLowerCase().includes(query)
      );
    }

    // Filter by park
    if (selectedPark && selectedPark !== 'all') {
      items = items.filter(item => item.park_id === selectedPark);
    }

    return items;
  }, [selectedTab, searchQuery, selectedPark, transformedItems]);

  const showParkFilter = selectedTab === 'attractions' || selectedTab === 'restaurants';

  return (
    <div className="bg-card rounded-xl border border-border sticky top-4 max-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Biblioteca de Atividades
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar atividade..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="parks" className="text-xs px-1">🏰</TabsTrigger>
            <TabsTrigger value="attractions" className="text-xs px-1">🎢</TabsTrigger>
            <TabsTrigger value="restaurants" className="text-xs px-1">🍽️</TabsTrigger>
            <TabsTrigger value="shopping" className="text-xs px-1">🛍️</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs px-1">🌴</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-1">📋</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Park Filter */}
      {showParkFilter && (
        <div className="p-3 border-b border-border bg-muted/50">
          <Select value={selectedPark} onValueChange={setSelectedPark}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Todos os Parques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Parques</SelectItem>
              {parks.map(park => (
                <SelectItem key={park.id} value={park.id}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Items List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado encontrado
            </p>
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

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/50 text-xs text-muted-foreground">
        <p>💡 <strong>Dica:</strong> Arraste as atividades para os dias do calendário</p>
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all touch-none ${
        isDragging ? 'shadow-lg scale-105' : ''
      }`}
      onDragStart={() => onDragStart?.(item)}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          {item.area && (
            <p className="text-xs text-muted-foreground truncate">{item.area}</p>
          )}
          {item.parkName && (
            <p className="text-xs text-muted-foreground truncate">{item.parkName}</p>
          )}
          {item.duration && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ⏱️ {item.duration} min
            </p>
          )}
        </div>
      </div>
      
      {/* Category Tag */}
      <div className="mt-2">
        <span
          className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          {item.category}
        </span>
      </div>
    </div>
  );
};

export default ActivityLibrary;
