import { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Backpack, 
  Phone, 
  Plane, 
  Baby, 
  Camera, 
  Heart, 
  Sun,
  Loader2,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';

const checklistCategories = {
  documents: {
    title: 'Documentos',
    icon: FileText,
    emoji: '📄',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    ringColor: 'stroke-blue-400',
    items: [
      { id: 'passport', label: 'Passaporte válido', required: true },
      { id: 'visa', label: 'Visto americano válido', required: true },
      { id: 'tickets', label: 'Ingressos dos parques', required: true },
      { id: 'hotel', label: 'Comprovante de hotel', required: true },
      { id: 'insurance', label: 'Seguro viagem', required: true },
      { id: 'car', label: 'Reserva de carro (se aplicável)', required: false },
      { id: 'cnh', label: 'CNH válida (para dirigir)', required: false },
      { id: 'credit_card', label: 'Cartão de crédito internacional', required: true },
      { id: 'travel_insurance_card', label: 'Cartão do seguro viagem físico', required: false },
      { id: 'vaccination', label: 'Comprovante de vacinas (se necessário)', required: false },
    ]
  },
  luggage: {
    title: 'Mala de Viagem',
    icon: Backpack,
    emoji: '🎒',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    ringColor: 'stroke-amber-400',
    items: [
      { id: 'sunscreen', label: 'Protetor solar', required: true },
      { id: 'hat', label: 'Boné ou chapéu', required: false },
      { id: 'sunglasses', label: 'Óculos de sol', required: false },
      { id: 'rain_coat', label: 'Capa de chuva', required: true },
      { id: 'portable_charger', label: 'Carregador portátil', required: true },
      { id: 'comfortable_shoes', label: 'Sapatos confortáveis', required: true },
      { id: 'jacket', label: 'Casaco leve', required: true },
      { id: 'medicine', label: 'Remédios básicos', required: false },
      { id: 'band_aids', label: 'Band-aids', required: false },
      { id: 'pen', label: 'Caneta para autógrafos', required: false },
      { id: 'adapter', label: 'Adaptador de tomada', required: true },
      { id: 'headphones', label: 'Fone de ouvido', required: false },
      { id: 'cable_charger', label: 'Cabo e carregador do celular', required: true },
    ]
  },
  apps: {
    title: 'Aplicativos',
    icon: Phone,
    emoji: '📱',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
    ringColor: 'stroke-violet-400',
    items: [
      { id: 'mde', label: 'My Disney Experience instalado', required: true },
      { id: 'mde_logged', label: 'My Disney Experience logado', required: true },
      { id: 'universal', label: 'Universal Orlando Resort app', required: true },
      { id: 'universal_logged', label: 'Universal app logado', required: true },
      { id: 'uber', label: 'Uber instalado', required: false },
      { id: 'google_maps', label: 'Google Maps offline', required: true },
      { id: 'translator', label: 'App de tradução', required: false },
      { id: 'whatsapp', label: 'WhatsApp funcionando', required: true },
      { id: 'bank_app', label: 'App do banco instalado', required: false },
    ]
  },
  airport: {
    title: 'Aeroporto',
    icon: Plane,
    emoji: '✈️',
    gradient: 'from-sky-500/20 to-indigo-500/20',
    iconColor: 'text-sky-400',
    ringColor: 'stroke-sky-400',
    items: [
      { id: 'online_checkin', label: 'Check-in online realizado', required: true },
      { id: 'boarding_pass', label: 'Cartão de embarque (digital ou impresso)', required: true },
      { id: 'carry_on', label: 'Bagagem de mão dentro do peso', required: true },
      { id: 'liquids', label: 'Líquidos em frascos até 100ml', required: true },
      { id: 'electronics', label: 'Eletrônicos organizados para raio-x', required: false },
      { id: 'snacks', label: 'Snacks para o voo', required: false },
      { id: 'neck_pillow', label: 'Travesseiro de pescoço', required: false },
      { id: 'entertainment', label: 'Entretenimento (séries/filmes baixados)', required: false },
    ]
  },
  health: {
    title: 'Saúde',
    icon: Heart,
    emoji: '❤️',
    gradient: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-400',
    ringColor: 'stroke-rose-400',
    items: [
      { id: 'prescription', label: 'Receitas médicas (em inglês se possível)', required: false },
      { id: 'prescription_meds', label: 'Medicamentos de uso contínuo', required: false },
      { id: 'pain_relief', label: 'Analgésicos', required: false },
      { id: 'antacid', label: 'Antiácido', required: false },
      { id: 'allergy_meds', label: 'Antialérgico', required: false },
      { id: 'first_aid', label: 'Kit de primeiros socorros básico', required: false },
      { id: 'hand_sanitizer', label: 'Álcool em gel', required: false },
      { id: 'lip_balm', label: 'Protetor labial', required: false },
    ]
  },
  kids: {
    title: 'Crianças',
    icon: Baby,
    emoji: '👶',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    ringColor: 'stroke-emerald-400',
    items: [
      { id: 'stroller', label: 'Carrinho de bebê (se aplicável)', required: false },
      { id: 'diapers', label: 'Fraldas suficientes', required: false },
      { id: 'baby_food', label: 'Comida/fórmula de bebê', required: false },
      { id: 'favorite_toy', label: 'Brinquedo favorito', required: false },
      { id: 'change_clothes', label: 'Muda de roupa extra', required: false },
      { id: 'autograph_book', label: 'Livro de autógrafos', required: false },
      { id: 'kids_sunscreen', label: 'Protetor solar infantil', required: false },
      { id: 'snacks_kids', label: 'Lanches saudáveis', required: false },
    ]
  },
  parkDay: {
    title: 'Dia no Parque',
    icon: Sun,
    emoji: '🎢',
    gradient: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-400',
    ringColor: 'stroke-yellow-400',
    items: [
      { id: 'phone_charged', label: 'Celular 100% carregado', required: true },
      { id: 'powerbank_charged', label: 'Carregador portátil carregado', required: true },
      { id: 'chip_working', label: 'Chip de internet funcionando', required: true },
      { id: 'apps_updated', label: 'Apps dos parques atualizados', required: true },
      { id: 'apps_logged', label: 'Apps logados e funcionando', required: true },
      { id: 'tickets_linked', label: 'Ingressos vinculados no app', required: true },
      { id: 'credit_card_ready', label: 'Cartão de crédito pronto', required: true },
      { id: 'sunscreen_applied', label: 'Protetor solar aplicado', required: true },
      { id: 'comfortable_outfit', label: 'Roupa e sapato confortáveis', required: true },
      { id: 'rain_gear', label: 'Capa de chuva na mochila', required: true },
      { id: 'water_bottle', label: 'Garrafa de água', required: false },
      { id: 'snacks_ready', label: 'Lanchinhos na mochila', required: false },
      { id: 'id_document', label: 'Documento de identidade', required: true },
      { id: 'guide_contact', label: 'Contato do guia salvo', required: true },
    ]
  },
  photography: {
    title: 'Fotografia',
    icon: Camera,
    emoji: '📸',
    gradient: 'from-fuchsia-500/20 to-purple-500/20',
    iconColor: 'text-fuchsia-400',
    ringColor: 'stroke-fuchsia-400',
    items: [
      { id: 'camera', label: 'Câmera carregada', required: false },
      { id: 'memory_card', label: 'Cartão de memória com espaço', required: false },
      { id: 'extra_battery', label: 'Bateria extra da câmera', required: false },
      { id: 'phone_storage', label: 'Espaço no celular para fotos', required: true },
      { id: 'selfie_stick', label: 'Bastão de selfie (onde permitido)', required: false },
      { id: 'photopass', label: 'Memory Maker/PhotoPass configurado', required: false },
    ]
  }
};

type CategoryKey = keyof typeof checklistCategories;

// SVG circular progress ring
const ProgressRing = ({ progress, size = 52, strokeWidth = 4, className }: { 
  progress: number; size?: number; strokeWidth?: number; className?: string 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className={cn("transform -rotate-90", className)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={cn("transition-all duration-700 ease-out", className)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

const Checklists = () => {
  const { travelProfile, updateTravelProfile, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const checkedItems = travelProfile.checklistItems || {};

  const toggleItem = async (id: string) => {
    const newCheckedItems = { ...checkedItems, [id]: !checkedItems[id] };
    
    setIsSaving(true);
    try {
      await updateTravelProfile({ checklistItems: newCheckedItems });
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast.error('Erro ao salvar checklist');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryProgress = (categoryKey: CategoryKey) => {
    const items = checklistCategories[categoryKey].items;
    const checked = items.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / items.length) * 100);
  };

  const getCategoryCheckedCount = (categoryKey: CategoryKey) => {
    const items = checklistCategories[categoryKey].items;
    return items.filter(item => checkedItems[item.id]).length;
  };

  const getTotalProgress = () => {
    const allItems = Object.values(checklistCategories).flatMap(cat => cat.items);
    const checked = allItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / allItems.length) * 100);
  };

  const getTotalChecked = () => {
    const allItems = Object.values(checklistCategories).flatMap(cat => cat.items);
    return allItems.filter(item => checkedItems[item.id]).length;
  };

  const getTotalItems = () => {
    return Object.values(checklistCategories).flatMap(cat => cat.items).length;
  };

  const getCompletedCategories = () => {
    return Object.keys(checklistCategories).filter(
      key => getCategoryProgress(key as CategoryKey) === 100
    ).length;
  };

  const totalProgress = getTotalProgress();
  const totalChecked = getTotalChecked();
  const totalItems = getTotalItems();
  const completedCategories = getCompletedCategories();
  const totalCategories = Object.keys(checklistCategories).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SavingIndicator isSaving={isSaving} />
      
      <div className="space-y-5 pb-24">
        {/* Hero Header with big progress ring */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border p-5 sm:p-6">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-5">
            {/* Big progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing progress={totalProgress} size={80} strokeWidth={6} className="stroke-primary" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground leading-none">{totalProgress}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Checklists</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {totalProgress === 100 
                  ? '🎉 Tudo pronto para a viagem!' 
                  : `${totalChecked} de ${totalItems} itens prontos`
                }
              </p>
              
              {/* Stats row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                  <Trophy className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-medium text-foreground">
                    {completedCategories}/{totalCategories} categorias
                  </span>
                </div>
                {totalProgress > 0 && totalProgress < 100 && (
                  <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                    <Star className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Faltam {totalItems - totalChecked}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <Accordion type="single" collapsible className="space-y-2.5">
          {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category], index) => {
            const progress = getCategoryProgress(key);
            const checkedCount = getCategoryCheckedCount(key);
            const totalCount = category.items.length;
            const isComplete = progress === 100;
            
            return (
              <AccordionItem 
                key={key} 
                value={key}
                className="border-0 rounded-xl overflow-hidden"
              >
                <AccordionTrigger 
                  className={cn(
                    "px-4 py-3.5 hover:no-underline rounded-xl transition-all duration-200",
                    "bg-gradient-to-r border border-border/60",
                    isComplete 
                      ? "from-emerald-500/10 to-green-500/5 border-emerald-500/20" 
                      : category.gradient,
                    "[&[data-state=open]]:rounded-b-none [&[data-state=open]]:border-b-0"
                  )}
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    {/* Mini progress ring with emoji */}
                    <div className="relative flex-shrink-0">
                      <ProgressRing 
                        progress={progress} 
                        size={44} 
                        strokeWidth={3} 
                        className={isComplete ? 'stroke-emerald-400' : category.ringColor} 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base leading-none">{isComplete ? '✅' : category.emoji}</span>
                      </div>
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-[15px]">{category.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-xs font-medium",
                          isComplete ? "text-emerald-400" : "text-muted-foreground"
                        )}>
                          {isComplete ? 'Completo!' : `${checkedCount}/${totalCount} itens`}
                        </span>
                        {!isComplete && progress > 0 && (
                          <span className="text-xs font-bold text-primary">{progress}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className={cn(
                  "border border-t-0 border-border/60 rounded-b-xl",
                  isComplete ? "border-emerald-500/20" : ""
                )}>
                  <div className="p-2 sm:p-3 space-y-1">
                    {category.items.map((item, itemIndex) => {
                      const isChecked = checkedItems[item.id] || false;
                      return (
                        <motion.div
                          key={item.id}
                          initial={false}
                          animate={isChecked ? { scale: [1, 1.01, 1] } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left",
                              "active:scale-[0.98]",
                              isChecked 
                                ? "bg-emerald-500/8" 
                                : "hover:bg-muted/40"
                            )}
                          >
                            <div className={cn(
                              "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                              isChecked 
                                ? "bg-emerald-500 border-emerald-500" 
                                : "border-muted-foreground/40"
                            )}>
                              <AnimatePresence>
                                {isChecked && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <span className={cn(
                              "flex-1 text-sm transition-all duration-200",
                              isChecked 
                                ? "text-muted-foreground line-through" 
                                : "text-foreground"
                            )}>
                              {item.label}
                            </span>

                            {item.required && !isChecked && (
                              <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-destructive/15 text-destructive px-2 py-0.5 rounded-full">
                                Obrigatório
                              </span>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </AppLayout>
  );
};

export default Checklists;
