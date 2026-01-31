import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  GripVertical, 
  Smartphone, 
  Monitor, 
  Navigation,
  LayoutDashboard,
  User,
  Star,
  Calendar,
  Map,
  MapPin,
  Zap,
  BookOpen,
  CheckSquare,
  FileText,
  MessageCircle,
  Settings,
  Save,
  UtensilsCrossed,
  Route,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageAccess {
  id: string;
  page_key: string;
  page_name: string;
  page_icon: string;
  basic_visible: boolean;
  premium_visible: boolean;
  travel_mode_visible: boolean;
  sort_order: number;
  mobile_sort_order: number;
  desktop_sort_order: number;
  travel_mode_sort_order: number;
}

type SortContext = 'mobile' | 'desktop' | 'travel_mode';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  User,
  Star,
  Calendar,
  Map,
  MapPin,
  Zap,
  BookOpen,
  CheckSquare,
  FileText,
  MessageCircle,
  Settings,
  UtensilsCrossed,
  Route,
  Headphones,
};

interface SortableItemProps {
  page: PageAccess;
  context: SortContext;
  onVisibilityChange?: (id: string, visible: boolean) => void;
  showVisibilityToggle?: boolean;
}

function SortableItem({ page, context, onVisibilityChange, showVisibilityToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = iconMap[page.page_icon] || FileText;
  const isVisible = context === 'travel_mode' ? page.travel_mode_visible : true;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      } ${!isVisible && showVisibilityToggle ? 'opacity-50' : ''}`}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-sm">{page.page_name}</p>
        <p className="text-xs text-muted-foreground">/{page.page_key}</p>
      </div>

      {showVisibilityToggle && onVisibilityChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isVisible ? 'Visível' : 'Oculto'}
          </span>
          <Switch
            checked={isVisible}
            onCheckedChange={(checked) => onVisibilityChange(page.id, checked)}
          />
        </div>
      )}
    </div>
  );
}

export function MenuOrderManager() {
  const [pages, setPages] = useState<PageAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<SortContext>('mobile');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_page_access')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setPages(data as PageAccess[]);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      toast.error('Erro ao carregar páginas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const getSortedPages = (context: SortContext): PageAccess[] => {
    const sortKey = `${context}_sort_order` as keyof PageAccess;
    return [...pages].sort((a, b) => {
      const aOrder = (a[sortKey] as number) ?? a.sort_order ?? 0;
      const bOrder = (b[sortKey] as number) ?? b.sort_order ?? 0;
      return aOrder - bOrder;
    });
  };

  const handleDragEnd = (event: DragEndEvent, context: SortContext) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sortedPages = getSortedPages(context);
      const oldIndex = sortedPages.findIndex((p) => p.id === active.id);
      const newIndex = sortedPages.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(sortedPages, oldIndex, newIndex);
      
      // Update the sort order for this context
      const sortKey = `${context}_sort_order` as keyof PageAccess;
      const updatedPages = pages.map((page) => {
        const newOrder = reordered.findIndex((p) => p.id === page.id);
        return {
          ...page,
          [sortKey]: newOrder,
        };
      });

      setPages(updatedPages);
      setHasChanges(true);
    }
  };

  const handleVisibilityChange = (id: string, visible: boolean) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, travel_mode_visible: visible } : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update all pages
      for (const page of pages) {
        const { error } = await supabase
          .from('plan_page_access')
          .update({
            travel_mode_visible: page.travel_mode_visible,
            mobile_sort_order: page.mobile_sort_order,
            desktop_sort_order: page.desktop_sort_order,
            travel_mode_sort_order: page.travel_mode_sort_order,
          })
          .eq('id', page.id);

        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso!');
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ordem do Menu
            </CardTitle>
            <CardDescription>
              Arraste e solte para reordenar os itens do menu em cada contexto.
              No Modo Viagem, você também pode controlar a visibilidade.
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SortContext)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="travel_mode" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Modo Viagem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile">
            <div className="mb-4">
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                <Smartphone className="w-3 h-3 mr-1" />
                Ordem do menu no aplicativo móvel
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              📱 <strong>Barra Inferior:</strong> Os 4 primeiros itens marcados como "dashboard", "perfil", "multipass" e "agenda" 
              aparecem na barra de navegação inferior. A ordem aqui define a sequência de exibição.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'mobile')}
            >
              <SortableContext
                items={getSortedPages('mobile').map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPages('mobile').map((page) => {
                  const isBottomNavItem = ['dashboard', 'perfil', 'multipass', 'agenda'].includes(page.page_key);
                  return (
                    <div key={page.id} className="relative">
                      {isBottomNavItem && (
                        <Badge className="absolute -top-1 -right-1 z-10 text-[10px] bg-blue-500">
                          Barra Inferior
                        </Badge>
                      )}
                      <SortableItem page={page} context="mobile" />
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>
          </TabsContent>

          <TabsContent value="desktop">
            <div className="mb-4">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                <Monitor className="w-3 h-3 mr-1" />
                Ordem do menu na versão desktop
              </Badge>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'desktop')}
            >
              <SortableContext
                items={getSortedPages('desktop').map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPages('desktop').map((page) => (
                  <SortableItem key={page.id} page={page} context="desktop" />
                ))}
              </SortableContext>
            </DndContext>
          </TabsContent>

          <TabsContent value="travel_mode">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                <Navigation className="w-3 h-3 mr-1" />
                Modo Viagem - Ordem e Visibilidade
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              💡 <strong>Dica:</strong> No Modo Viagem, os clientes veem apenas os itens marcados como visíveis.
              Use o toggle para controlar o acesso.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'travel_mode')}
            >
              <SortableContext
                items={getSortedPages('travel_mode').map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPages('travel_mode').map((page) => (
                  <SortableItem
                    key={page.id}
                    page={page}
                    context="travel_mode"
                    showVisibilityToggle
                    onVisibilityChange={handleVisibilityChange}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-sm text-muted-foreground">
          💡 <strong>Importante:</strong> As alterações de ordem afetam como os itens aparecem no menu 
          para todos os usuários. Certifique-se de salvar após fazer as modificações.
        </p>
      </CardContent>
    </Card>
  );
}