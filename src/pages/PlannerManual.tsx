import { useState, useCallback, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2, Download, Plus, Loader2, Calendar, FileText, FileStack } from 'lucide-react';
import { exportPlannerToPDF } from '@/utils/exportPlannerPDF';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityLibrary, LibraryItem, PlannerCalendar, PlannerItem } from '@/components/planner';
import { usePlannerDragDrop } from '@/hooks/usePlannerDragDrop';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';
import { TemplateGalleryModal } from '@/components/planner/TemplateGalleryModal';
import { PlannerTemplate } from '@/data/plannerTemplates';

const PlannerManual = () => {
  const { user, travelProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [activeItem, setActiveItem] = useState<LibraryItem | PlannerItem | null>(null);
  const [activeItemType, setActiveItemType] = useState<'library' | 'calendar' | null>(null);
  const [showLibrary, setShowLibrary] = useState(!isMobile);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Configure sensors for better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Get or create user planner
  const { data: planner, isLoading: plannerLoading } = useQuery({
    queryKey: ['user-planner', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Try to get existing planner
      const { data: existing } = await supabase
        .from('user_planners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (existing) return existing;
      
      // Create new planner based on profile dates
      const startDate = travelProfile?.arrivalDate || format(new Date(), 'yyyy-MM-dd');
      const endDate = travelProfile?.departureDate || format(addDays(new Date(), 7), 'yyyy-MM-dd');
      const totalDays = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1);
      
      const { data: newPlanner, error } = await supabase
        .from('user_planners')
        .insert({
          user_id: user.id,
          title: 'Meu Roteiro Orlando',
          start_date: startDate,
          end_date: endDate,
          total_days: totalDays
        })
        .select()
        .single();
      
      if (error) throw error;
      return newPlanner;
    },
    enabled: !!user?.id
  });

  // Use drag-drop hook
  const { 
    items: plannerItems, 
    isLoading: itemsLoading,
    isSaving,
    handleDrop, 
    handleRemove, 
    handleReorder,
    handleMoveToSlot,
    toggleCompleted,
    refetchItems
  } = usePlannerDragDrop({ plannerId: planner?.id || '' });

  // Handle drag start - detect if from library or calendar
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragId = event.active.id as string;
    const itemData = event.active.data.current;
    
    if (dragId.startsWith('library-')) {
      // From library
      setActiveItem(itemData as LibraryItem);
      setActiveItemType('library');
    } else {
      // From calendar (existing planner item)
      const existingItem = plannerItems.find(item => item.id === dragId);
      if (existingItem) {
        setActiveItem(existingItem);
        setActiveItemType('calendar');
      }
    }
  }, [plannerItems]);

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveItem(null);
    setActiveItemType(null);
    
    if (!over || !planner?.id) return;

    const dragId = active.id as string;
    const dropTarget = over.id as string;
    
    // Parse drop target - format: "YYYY-MM-DD-slotId"
    const match = dropTarget.match(/^(\d{4}-\d{2}-\d{2})-(\w+)$/);
    if (!match) {
      // Maybe dropped on another item for reordering - handled by PlannerCalendar
      return;
    }
    
    const [, date, timeSlot] = match;

    if (dragId.startsWith('library-')) {
      // Dropping from library
      const draggedItem = active.data.current as LibraryItem;
      
      try {
        await handleDrop(draggedItem, date, timeSlot);
      } catch (error) {
        toast({
          title: 'Erro ao adicionar',
          description: 'Não foi possível adicionar o item.',
          variant: 'destructive'
        });
      }
    } else {
      // Moving existing item to different slot
      const existingItem = plannerItems.find(item => item.id === dragId);
      if (existingItem) {
        // Check if moving to different slot
        if (existingItem.date !== date || existingItem.time_slot !== timeSlot) {
          try {
            await handleMoveToSlot(dragId, date, timeSlot);
          } catch (error) {
            toast({
              title: 'Erro ao mover',
              description: 'Não foi possível mover o item.',
              variant: 'destructive'
            });
          }
        }
      }
    }
  }, [planner?.id, handleDrop, handleMoveToSlot, plannerItems, toast]);

  // Handle drop from PlannerCalendar (for moves between slots)
  const handleCalendarDrop = useCallback(async (item: any, date: string, timeSlot: string) => {
    // Check if it's a library item or existing planner item
    if (item.type && ['park', 'attraction', 'restaurant', 'shopping', 'activity'].includes(item.type)) {
      // Library item
      await handleDrop(item, date, timeSlot);
    } else if (item.id && item.planner_id) {
      // Existing planner item - move to new slot
      if (item.date !== date || item.time_slot !== timeSlot) {
        await handleMoveToSlot(item.id, date, timeSlot);
      }
    }
  }, [handleDrop, handleMoveToSlot]);

  // Export planner as text (copy to clipboard)
  const handleExportText = useCallback(() => {
    if (!planner || !plannerItems.length) {
      toast({
        title: 'Nada para exportar',
        description: 'Adicione itens ao seu roteiro primeiro.',
        variant: 'destructive'
      });
      return;
    }

    // Group items by date
    const grouped = plannerItems.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, typeof plannerItems>);

    // Generate text
    let text = `🏰 ${planner.title}\n`;
    text += `📅 ${format(new Date(planner.start_date), 'dd/MM/yyyy')} - ${format(new Date(planner.end_date), 'dd/MM/yyyy')}\n\n`;

    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, items]) => {
        text += `📆 ${format(new Date(date), 'EEEE, dd/MM', { locale: ptBR })}\n`;
        
        // Sort by time slot
        const slotOrder = { morning: 0, afternoon: 1, evening: 2, night: 3 };
        items.sort((a, b) => 
          (slotOrder[a.time_slot as keyof typeof slotOrder] || 0) - 
          (slotOrder[b.time_slot as keyof typeof slotOrder] || 0)
        );
        
        items.forEach(item => {
          const slotEmoji = { morning: '☀️', afternoon: '🌤️', evening: '🌙', night: '🌃' };
          text += `  ${slotEmoji[item.time_slot as keyof typeof slotEmoji] || '📍'} ${item.icon || ''} ${item.item_name}`;
          if (item.start_time) text += ` (${item.start_time})`;
          if (item.completed) text += ' ✓';
          text += '\n';
        });
        text += '\n';
      });

    // Copy to clipboard
    navigator.clipboard.writeText(text);
    toast({
      title: 'Roteiro copiado!',
      description: 'O roteiro foi copiado para a área de transferência.',
    });
  }, [planner, plannerItems, toast]);

  // Export planner as PDF
  const handleExportPDF = useCallback(() => {
    if (!planner || !plannerItems.length) {
      toast({
        title: 'Nada para exportar',
        description: 'Adicione itens ao seu roteiro primeiro.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const fileName = exportPlannerToPDF(planner, plannerItems);
      toast({
        title: 'PDF gerado!',
        description: `Arquivo ${fileName} baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo.',
        variant: 'destructive'
      });
    }
  }, [planner, plannerItems, toast]);

  // Share planner
  const handleShare = useCallback(async () => {
    if (!planner) return;
    
    const shareData = {
      title: planner.title,
      text: `Confira meu roteiro para Orlando!`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    }
  }, [planner, toast]);

  // Import template items
  const handleImportTemplate = useCallback(async (template: PlannerTemplate) => {
    if (!planner?.id) return;

    try {
      const startDate = new Date(planner.start_date);
      
      // Prepare all items to insert
      const itemsToInsert = template.days.flatMap(day => {
        const dayDate = format(addDays(startDate, day.dayOffset), 'yyyy-MM-dd');
        
        return day.items.map((item, index) => ({
          planner_id: planner.id,
          date: dayDate,
          time_slot: item.time_slot,
          item_type: item.item_type,
          item_name: item.item_name,
          category: item.category,
          color: item.color,
          icon: item.icon,
          duration: item.duration || null,
          start_time: item.start_time || null,
          notes: item.notes || null,
          order_index: index,
          completed: false,
          reservation_confirmed: false,
        }));
      });

      // Insert all items
      const { error } = await supabase
        .from('planner_items')
        .insert(itemsToInsert);

      if (error) throw error;

      // Refresh planner items
      await refetchItems();
      
      toast({
        title: 'Template importado!',
        description: `${itemsToInsert.length} atividades adicionadas ao seu roteiro.`,
      });
    } catch (error) {
      console.error('Error importing template:', error);
      toast({
        title: 'Erro ao importar',
        description: 'Não foi possível importar o template.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [planner, refetchItems, toast]);

  if (plannerLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando seu roteiro...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO 
        title="Planejador Manual | Guia Orlando Mágico"
        description="Monte seu roteiro dia a dia arrastando atrações, restaurantes e atividades"
      />
      
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {planner?.title || 'Meu Roteiro'}
                </h1>
                {planner && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(planner.start_date), 'dd/MM/yyyy')} - {format(new Date(planner.end_date), 'dd/MM/yyyy')}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {planner.total_days} dias
                    </Badge>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {plannerItems.length} atividades
                    </Badge>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowTemplateModal(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary"
              >
                <FileStack className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
              {isMobile && (
                <Button
                  variant={showLibrary ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLibrary(!showLibrary)}
                  className="transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showLibrary ? 'Calendário' : 'Adicionar'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportText}>
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Copiar</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Calendar - 70% on desktop */}
            <div 
              className={cn(
                "flex-1 lg:w-[70%] transition-all duration-300",
                isMobile && showLibrary && "hidden"
              )}
            >
              {itemsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : planner ? (
                <PlannerCalendar
                  startDate={planner.start_date}
                  endDate={planner.end_date}
                  items={plannerItems}
                  onDrop={handleCalendarDrop}
                  onRemove={handleRemove}
                  onReorder={handleReorder}
                  onToggleComplete={toggleCompleted}
                />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum roteiro encontrado. Crie um novo para começar.
                  </p>
                </Card>
              )}
            </div>

            {/* Library Sidebar - 30% on desktop */}
            <div 
              className={cn(
                "lg:w-[30%] transition-all duration-300",
                isMobile && !showLibrary && "hidden"
              )}
            >
              <ActivityLibrary />
            </div>
          </div>
        </div>

        {/* Drag Overlay - visual feedback while dragging */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeItem && (
            <Card 
              className={cn(
                "p-3 shadow-2xl border-2 bg-background w-56 rotate-3 scale-105",
                activeItemType === 'library' ? "border-primary" : "border-green-500"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {'icon' in activeItem ? activeItem.icon : '📍'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {'name' in activeItem ? activeItem.name : 
                     'item_name' in activeItem ? activeItem.item_name : 'Item'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {'category' in activeItem ? activeItem.category : ''}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="animate-pulse">🎯</span>
                <span>Solte em um horário do calendário</span>
              </div>
            </Card>
          )}
        </DragOverlay>

        <SavingIndicator isSaving={isSaving} />

        {/* Template Gallery Modal */}
        {planner && (
          <TemplateGalleryModal
            open={showTemplateModal}
            onOpenChange={setShowTemplateModal}
            startDate={planner.start_date}
            plannerId={planner.id}
            onImport={handleImportTemplate}
          />
        )}
      </DndContext>
    </AppLayout>
  );
};

export default PlannerManual;
