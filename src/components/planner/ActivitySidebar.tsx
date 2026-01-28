import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Castle, Utensils, ShoppingBag, Palmtree } from 'lucide-react';

export interface DraggableActivity {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity';
  duration?: number;
  parkName?: string;
}

interface ActivitySidebarProps {
  parks: DraggableActivity[];
  attractions: DraggableActivity[];
  restaurants: DraggableActivity[];
  shopping: DraggableActivity[];
  activities: DraggableActivity[];
  onAddCustom: () => void;
}

export const ActivitySidebar = ({
  parks,
  attractions,
  restaurants,
  shopping,
  activities,
  onAddCustom,
}: ActivitySidebarProps) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('parks');

  const filterItems = (items: DraggableActivity[]) => {
    if (!search.trim()) return items;
    const searchLower = search.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  };

  const filteredParks = useMemo(() => filterItems(parks), [parks, search]);
  const filteredAttractions = useMemo(() => filterItems(attractions), [attractions, search]);
  const filteredRestaurants = useMemo(() => filterItems(restaurants), [restaurants, search]);
  const filteredShopping = useMemo(() => filterItems(shopping), [shopping, search]);
  const filteredActivities = useMemo(() => filterItems(activities), [activities, search]);

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Atividades
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atividades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-5 mx-4 mt-3">
          <TabsTrigger value="parks" className="text-xs px-1">
            <Castle className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="attractions" className="text-xs px-1">
            🎠
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="text-xs px-1">
            <Utensils className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="shopping" className="text-xs px-1">
            <ShoppingBag className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs px-1">
            <Palmtree className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4 py-3">
          <TabsContent value="parks" className="mt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Arraste os parques para o calendário
            </p>
            {filteredParks.map(park => (
              <DraggableItem key={park.id} item={park} />
            ))}
            {filteredParks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum parque encontrado
              </p>
            )}
          </TabsContent>

          <TabsContent value="attractions" className="mt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Atrações dos parques
            </p>
            {filteredAttractions.map(attraction => (
              <DraggableItem key={attraction.id} item={attraction} />
            ))}
            {filteredAttractions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atração encontrada
              </p>
            )}
          </TabsContent>

          <TabsContent value="restaurants" className="mt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Restaurantes e refeições
            </p>
            {filteredRestaurants.map(restaurant => (
              <DraggableItem key={restaurant.id} item={restaurant} />
            ))}
            {filteredRestaurants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum restaurante encontrado
              </p>
            )}
          </TabsContent>

          <TabsContent value="shopping" className="mt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Compras e outlets
            </p>
            {filteredShopping.map(shop => (
              <DraggableItem key={shop.id} item={shop} />
            ))}
            {filteredShopping.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum local encontrado
              </p>
            )}
          </TabsContent>

          <TabsContent value="activities" className="mt-0 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Atividades fora dos parques
            </p>
            {filteredActivities.map(activity => (
              <DraggableItem key={activity.id} item={activity} />
            ))}
            {filteredActivities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atividade encontrada
              </p>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer - Add Custom */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onAddCustom}
          className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary"
        >
          + Adicionar item personalizado
        </button>
      </div>
    </div>
  );
};

// Draggable Item Component
interface DraggableItemProps {
  item: DraggableActivity;
}

const DraggableItem = ({ item }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${item.id}`,
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
      {...attributes}
      {...listeners}
      className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all touch-none"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: `${item.color}20`, color: item.color }}
            >
              {item.category}
            </Badge>
            {item.duration && (
              <span className="text-[10px] text-muted-foreground">
                ⏱️ {item.duration}min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySidebar;
