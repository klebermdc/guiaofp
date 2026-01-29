import { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Backpack, 
  Phone, 
  Plane, 
  Shield, 
  Baby, 
  Camera, 
  Heart, 
  Utensils,
  Sun,
  Battery,
  Wifi,
  Pill,
  CreditCard,
  Car,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';

// All checklist categories
const checklistCategories = {
  documents: {
    title: 'Documentos',
    icon: FileText,
    color: 'from-blue-500 to-indigo-500',
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
    color: 'from-green-500 to-emerald-500',
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
    color: 'from-purple-500 to-pink-500',
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
    color: 'from-violet-500 to-purple-500',
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
    title: 'Saúde e Bem-estar',
    icon: Heart,
    color: 'from-red-500 to-rose-500',
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
    title: 'Para Crianças',
    icon: Baby,
    color: 'from-pink-500 to-rose-500',
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
    color: 'from-amber-500 to-orange-500',
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
    color: 'from-cyan-500 to-blue-500',
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

const Checklists = () => {
  const { travelProfile, updateTravelProfile, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>(undefined);

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

  const getTotalProgress = () => {
    const allItems = Object.values(checklistCategories).flatMap(cat => cat.items);
    const checked = allItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / allItems.length) * 100);
  };

  const getRequiredProgress = () => {
    const requiredItems = Object.values(checklistCategories).flatMap(cat => 
      cat.items.filter(item => item.required)
    );
    const checked = requiredItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / requiredItems.length) * 100);
  };

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
      <div className="space-y-8 pb-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-5 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  Checklists de Viagem
                </h1>
                <p className="text-white/80 text-sm sm:text-lg">Tudo pronto para sua aventura ✨</p>
              </div>
            </div>
            
            {/* Progress Circles */}
            <div className="flex items-center gap-6 mt-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="40" cy="40" r="36" 
                    className="transition-all duration-700 ease-out"
                    stroke="white" 
                    strokeWidth="8" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${getTotalProgress() * 2.26} 226`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{getTotalProgress()}%</span>
                </div>
              </div>
              <div className="text-white/90">
                <p className="font-medium text-base">Progresso Total</p>
                <p className="text-sm text-white/70">{getRequiredProgress()}% dos obrigatórios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Button style like "Estratégias por Parque" */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Selecione uma categoria</h2>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
              {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category]) => {
                const Icon = category.icon;
                const progress = getCategoryProgress(key);
                const isActive = activeAccordion === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveAccordion(isActive ? undefined : key)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 whitespace-nowrap
                      ${isActive 
                        ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                      {progress}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* All Checklists */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Todos os Checklists
          </h2>
          
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-4"
            value={activeAccordion}
            onValueChange={setActiveAccordion}
          >
            {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category]) => {
              const Icon = category.icon;
              const progress = getCategoryProgress(key);
              
              return (
                <AccordionItem 
                  key={key} 
                  value={key} 
                  className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display font-bold text-base sm:text-lg">{category.title}</h3>
                          <Badge variant={progress === 100 ? "default" : "secondary"} className="hidden sm:flex">
                            {progress === 100 ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Completo
                              </>
                            ) : (
                              `${progress}%`
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {category.items.filter(item => checkedItems[item.id]).length} de {category.items.length} itens
                        </p>
                      </div>
                      <div className="w-12 h-12 hidden md:flex items-center justify-center">
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-muted" strokeWidth="3" fill="none" />
                            <circle 
                              cx="20" cy="20" r="16" 
                              className={`transition-all duration-500`}
                              stroke="url(#gradient)" 
                              strokeWidth="3" 
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${progress * 1} 100`}
                            />
                          </svg>
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--accent))" />
                            </linearGradient>
                          </defs>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 pb-6">
                    <div className="space-y-2">
                      {category.items.map((item, index) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                            checkedItems[item.id] 
                              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 dark:from-emerald-900/20 dark:to-teal-900/20' 
                              : 'bg-muted/20 border-transparent hover:border-muted-foreground/20'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => toggleItem(item.id)}
                        >
                          <Checkbox 
                            id={item.id} 
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="w-6 h-6 rounded-lg border-2"
                          />
                          <label 
                            htmlFor={item.id} 
                            className={`flex-1 font-medium cursor-pointer transition-all ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item.label}
                          </label>
                          {item.required && (
                            <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm">
                              Obrigatório
                            </Badge>
                          )}
                          {checkedItems[item.id] && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default Checklists;
