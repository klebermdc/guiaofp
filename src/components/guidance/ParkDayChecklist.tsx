import { useState } from 'react';
import { 
  CheckCircle2, 
  Sun, 
  Battery, 
  Wifi, 
  Smartphone,
  CreditCard,
  Shirt,
  CloudRain,
  Droplet,
  Cookie,
  FileText,
  Headphones,
  Check,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const parkDayItems = [
  { id: 'pd_phone_charged', label: 'Celular 100% carregado', icon: Smartphone, required: true },
  { id: 'pd_powerbank_charged', label: 'Carregador portátil carregado', icon: Battery, required: true },
  { id: 'pd_chip_working', label: 'Chip de internet funcionando', icon: Wifi, required: true },
  { id: 'pd_apps_updated', label: 'Apps dos parques atualizados', icon: Smartphone, required: true },
  { id: 'pd_apps_logged', label: 'Apps logados e funcionando', icon: CheckCircle2, required: true },
  { id: 'pd_tickets_linked', label: 'Ingressos vinculados no app', icon: FileText, required: true },
  { id: 'pd_credit_card_ready', label: 'Cartão de crédito pronto', icon: CreditCard, required: true },
  { id: 'pd_sunscreen_applied', label: 'Protetor solar aplicado', icon: Sun, required: true },
  { id: 'pd_comfortable_outfit', label: 'Roupa e sapato confortáveis', icon: Shirt, required: true },
  { id: 'pd_rain_gear', label: 'Capa de chuva na mochila', icon: CloudRain, required: true },
  { id: 'pd_water_bottle', label: 'Garrafa de água', icon: Droplet, required: false },
  { id: 'pd_snacks_ready', label: 'Lanchinhos na mochila', icon: Cookie, required: false },
  { id: 'pd_id_document', label: 'Documento de identidade', icon: FileText, required: true },
  { id: 'pd_guide_contact', label: 'Contato do guia salvo', icon: Headphones, required: true },
];

export const ParkDayChecklist = () => {
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
      toast.error('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const getProgress = () => {
    const checked = parkDayItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / parkDayItems.length) * 100);
  };

  const getRequiredProgress = () => {
    const requiredItems = parkDayItems.filter(item => item.required);
    const checked = requiredItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / requiredItems.length) * 100);
  };

  const progress = getProgress();
  const requiredProgress = getRequiredProgress();

  if (isLoading) {
    return (
      <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden">
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              Preparo para o Dia do Parque
              {progress === 100 && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <Check className="w-3 h-3 mr-1" /> Pronto!
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Marque cada item conforme se prepara para o grande dia
            </CardDescription>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {requiredProgress}% dos itens obrigatórios concluídos
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {parkDayItems.map((item) => {
          const Icon = item.icon;
          const isChecked = checkedItems[item.id] || false;
          
          return (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                isChecked 
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 dark:from-emerald-900/20 dark:to-teal-900/20' 
                  : 'bg-background/50 border-transparent hover:border-amber-300/50'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <Checkbox 
                id={item.id} 
                checked={isChecked}
                onCheckedChange={() => toggleItem(item.id)}
                className="w-5 h-5 rounded-md border-2"
                disabled={isSaving}
              />
              <Icon className={`w-5 h-5 flex-shrink-0 ${isChecked ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <label 
                htmlFor={item.id} 
                className={`flex-1 text-sm font-medium cursor-pointer transition-all ${isChecked ? 'line-through text-muted-foreground' : ''}`}
              >
                {item.label}
              </label>
              {item.required && !isChecked && (
                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                  Obrigatório
                </Badge>
              )}
              {isChecked && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
        
        {isSaving && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
