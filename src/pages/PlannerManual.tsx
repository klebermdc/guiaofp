import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityLibrary, LibraryItem } from '@/components/planner';
import { PlannerCalendarView } from '@/components/planner/PlannerCalendarView';
import { usePlannerDragDrop } from '@/hooks/usePlannerDragDrop';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';

const PlannerManual = () => {
  const { user, travelProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeItem, setActiveItem] = useState<LibraryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(!isMobile);

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
    handleDrop, 
    handleRemove, 
    handleReorder,
    toggleCompleted 
  } = usePlannerDragDrop({ plannerId: planner?.id || '' });

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current as LibraryItem;
    setActiveItem(item);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveItem(null);
    
    const { active, over } = event;
    if (!over || !planner?.id) return;

    const draggedItem = active.data.current as LibraryItem;
    const dropTarget = over.id as string;
    
    // Parse drop target (format: "date-YYYY-MM-DD-slot-morning|afternoon|evening")
    const match = dropTarget.match(/^date-(\d{4}-\d{2}-\d{2})-slot-(\w+)$/);
    if (!match) return;
    
    const [, date, timeSlot] = match;
    
    setIsSaving(true);
    try {
      await handleDrop(draggedItem, date, timeSlot);
      toast({
        title: 'Item adicionado!',
        description: `${draggedItem.name} foi adicionado ao seu roteiro.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o item.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [planner?.id, handleDrop, toast]);

  // Export planner
  const handleExport = useCallback(() => {
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
        items.forEach(item => {
          text += `  ${item.icon || '📍'} ${item.item_name}`;
          if (item.start_time) text += ` (${item.start_time})`;
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

  if (plannerLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
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
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {planner?.title || 'Meu Roteiro'}
              </h1>
              {planner && (
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(planner.start_date), 'dd/MM/yyyy')} - {format(new Date(planner.end_date), 'dd/MM/yyyy')}
                  <Badge variant="secondary" className="ml-2">
                    {planner.total_days} dias
                  </Badge>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLibrary(!showLibrary)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showLibrary ? 'Calendário' : 'Adicionar'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Exportar</span>
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
              className={`flex-1 lg:w-[70%] ${isMobile && showLibrary ? 'hidden' : 'block'}`}
            >
              <PlannerCalendarView
                planner={planner}
                items={plannerItems}
                isLoading={itemsLoading}
                onRemoveItem={handleRemove}
                onToggleComplete={toggleCompleted}
                onReorder={handleReorder}
              />
            </div>

            {/* Library Sidebar - 30% on desktop */}
            <div 
              className={`lg:w-[30%] ${isMobile && !showLibrary ? 'hidden' : 'block'}`}
            >
              <div className="sticky top-4">
                <ActivityLibrary />
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && (
            <Card className="p-3 shadow-xl border-2 border-primary bg-background w-64">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeItem.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activeItem.name}</p>
                  <p className="text-xs text-muted-foreground">{activeItem.category}</p>
                </div>
              </div>
            </Card>
          )}
        </DragOverlay>

        <SavingIndicator isSaving={isSaving} />
      </DndContext>
    </AppLayout>
  );
};

export default PlannerManual;
