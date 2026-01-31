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
  ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const checklistCategories = {
  documents: {
    title: 'Documentos',
    icon: FileText,
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
      
      <div className="space-y-6 pb-24">
        {/* Header */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Checklists de Viagem</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize tudo para sua viagem
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">Progresso Total</span>
                <span className="text-primary font-bold">{getTotalChecked()}/{getTotalItems()} itens</span>
              </div>
              <Progress value={getTotalProgress()} className="h-3" />
              <p className="text-center text-lg font-bold text-primary">{getTotalProgress()}% completo</p>
            </div>
          </CardContent>
        </Card>

        {/* Categories Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category]) => {
            const Icon = category.icon;
            const progress = getCategoryProgress(key);
            const checkedCount = getCategoryCheckedCount(key);
            const totalCount = category.items.length;
            const isComplete = progress === 100;
            
            return (
              <AccordionItem 
                key={key} 
                value={key}
                className="border border-border rounded-xl overflow-hidden bg-card"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      isComplete ? "bg-green-500/20" : "bg-primary/20"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isComplete ? "text-green-500" : "text-primary"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{category.title}</span>
                        {isComplete && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-medium">
                            ✓ Completo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {checkedCount}/{totalCount} itens
                        </span>
                        <div className="flex-1 max-w-[100px]">
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        <span className="text-sm font-medium text-primary">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-1 pt-2">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          checkedItems[item.id] 
                            ? "bg-green-500/10 hover:bg-green-500/20" 
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <Checkbox 
                          checked={checkedItems[item.id] || false}
                          className={cn(
                            "h-5 w-5",
                            checkedItems[item.id] && "bg-green-500 border-green-500"
                          )}
                        />
                        <span className={cn(
                          "flex-1 text-sm",
                          checkedItems[item.id] 
                            ? "text-green-500 line-through" 
                            : "text-foreground"
                        )}>
                          {item.label}
                        </span>
                        {item.required && !checkedItems[item.id] && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                            Obrigatório
                          </span>
                        )}
                        {checkedItems[item.id] && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
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
    </AppLayout>
  );
};

export default Checklists;
