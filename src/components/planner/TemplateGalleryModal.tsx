import { useState, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileStack, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  PLANNER_TEMPLATES, 
  PlannerTemplate, 
  getDifficultyColor, 
  getCategoryColor 
} from '@/data/plannerTemplates';

interface TemplateGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: string;
  plannerId: string;
  onImport: (template: PlannerTemplate) => Promise<void>;
}

type CategoryFilter = 'all' | PlannerTemplate['category'];

const CATEGORY_FILTERS: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'disney', label: 'Disney', icon: '🏰' },
  { id: 'universal', label: 'Universal', icon: '⚡' },
  { id: 'shopping', label: 'Compras', icon: '🛍️' },
  { id: 'relaxed', label: 'Relaxado', icon: '🌴' },
];

export const TemplateGalleryModal = ({
  open,
  onOpenChange,
  startDate,
  plannerId,
  onImport,
}: TemplateGalleryModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PlannerTemplate | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const filteredTemplates = selectedCategory === 'all' 
    ? PLANNER_TEMPLATES 
    : PLANNER_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleImport = useCallback(async () => {
    if (!selectedTemplate) return;
    
    setIsImporting(true);
    try {
      await onImport(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    } finally {
      setIsImporting(false);
    }
  }, [selectedTemplate, onImport, onOpenChange]);

  const getDateForDay = (dayOffset: number) => {
    return format(addDays(new Date(startDate), dayOffset), 'dd/MM (EEE)', { locale: ptBR });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileStack className="h-5 w-5 text-primary" />
            Templates de Roteiro
          </DialogTitle>
          <DialogDescription>
            Escolha um roteiro pré-pronto para importar e personalizar
          </DialogDescription>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b bg-muted/30">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryFilter)}>
            <TabsList className="w-full h-auto p-1 bg-background/50 grid grid-cols-5 gap-1">
              {CATEGORY_FILTERS.map(cat => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Template List */}
          <ScrollArea className="flex-1 border-r">
            <div className="p-3 space-y-2">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                    selectedTemplate?.id === template.id && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] h-5">
                          <Calendar className="h-2.5 w-2.5 mr-1" />
                          {template.totalDays} {template.totalDays === 1 ? 'dia' : 'dias'}
                        </Badge>
                        <Badge className={cn("text-[10px] h-5", getDifficultyColor(template.difficulty))}>
                          {template.difficulty === 'easy' ? 'Tranquilo' : 
                           template.difficulty === 'moderate' ? 'Moderado' : 'Intenso'}
                        </Badge>
                        <Badge className={cn("text-[10px] h-5", getCategoryColor(template.category))}>
                          {template.category === 'disney' ? 'Disney' :
                           template.category === 'universal' ? 'Universal' :
                           template.category === 'shopping' ? 'Compras' :
                           template.category === 'mixed' ? 'Misto' : 'Relaxado'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      selectedTemplate?.id === template.id && "text-primary rotate-90"
                    )} />
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Template Details */}
          <div className="w-[280px] flex flex-col bg-muted/20">
            {selectedTemplate ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="text-center">
                      <span className="text-4xl">{selectedTemplate.icon}</span>
                      <h3 className="font-bold text-foreground mt-2">
                        {selectedTemplate.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedTemplate.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Destaques
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.highlights.map((h, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            {h}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Days Preview */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Programação
                      </h4>
                      <div className="space-y-2">
                        {selectedTemplate.days.map((day, idx) => (
                          <div 
                            key={idx}
                            className="bg-background rounded-lg p-2 border"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {getDateForDay(day.dayOffset)}
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">
                                {day.items.length} atividades
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {day.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background rounded-lg p-2 border text-center">
                        <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                        <p className="text-xs font-medium mt-1">
                          {selectedTemplate.totalDays} {selectedTemplate.totalDays === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                      <div className="bg-background rounded-lg p-2 border text-center">
                        <CheckCircle2 className="h-4 w-4 mx-auto text-muted-foreground" />
                        <p className="text-xs font-medium mt-1">
                          {selectedTemplate.days.reduce((acc, d) => acc + d.items.length, 0)} itens
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Import Button */}
                <div className="p-4 border-t bg-background">
                  <Button 
                    className="w-full" 
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <FileStack className="h-4 w-4 mr-2" />
                        Importar Template
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Os itens serão adicionados a partir de {format(new Date(startDate), 'dd/MM/yyyy')}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-center">
                <div>
                  <FileStack className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecione um template para ver os detalhes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGalleryModal;
