import { useState, useEffect } from 'react';
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
  Check,
  Loader2,
  Sparkles,
  Trophy,
  Star,
  Zap,
  PartyPopper
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// All checklist categories with unique vibrant colors
const checklistCategories = {
  documents: {
    title: 'Documentos',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
    emoji: '📋',
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
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    emoji: '🎒',
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
    color: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-300 dark:border-purple-700',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-600 dark:text-purple-400',
    emoji: '📱',
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
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-300 dark:border-violet-700',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    textColor: 'text-violet-600 dark:text-violet-400',
    emoji: '✈️',
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
    color: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-300 dark:border-rose-700',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    textColor: 'text-rose-600 dark:text-rose-400',
    emoji: '❤️',
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
    color: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-300 dark:border-pink-700',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50',
    textColor: 'text-pink-600 dark:text-pink-400',
    emoji: '👶',
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
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    textColor: 'text-amber-600 dark:text-amber-400',
    emoji: '🎢',
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
    color: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    emoji: '📸',
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
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('documents');
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentlyChecked, setRecentlyChecked] = useState<string | null>(null);

  const checkedItems = travelProfile.checklistItems || {};

  const toggleItem = async (id: string) => {
    const wasChecked = checkedItems[id];
    const newCheckedItems = { ...checkedItems, [id]: !checkedItems[id] };
    
    // Show animation for newly checked items
    if (!wasChecked) {
      setRecentlyChecked(id);
      setTimeout(() => setRecentlyChecked(null), 600);
    }
    
    setIsSaving(true);
    try {
      await updateTravelProfile({ checklistItems: newCheckedItems });
      
      // Check if category is now complete
      const categoryItems = checklistCategories[activeCategory].items;
      const allChecked = categoryItems.every(item => 
        item.id === id ? !wasChecked : newCheckedItems[item.id]
      );
      
      if (allChecked && !wasChecked) {
        setShowConfetti(true);
        toast.success('🎉 Categoria completa!', {
          description: `Você completou "${checklistCategories[activeCategory].title}"!`
        });
        setTimeout(() => setShowConfetti(false), 3000);
      }
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

  const getCompletedCategories = () => {
    return Object.keys(checklistCategories).filter(key => 
      getCategoryProgress(key as CategoryKey) === 100
    ).length;
  };

  const activeData = checklistCategories[activeCategory];
  const activeProgress = getCategoryProgress(activeCategory);

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
      
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-8xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 pb-12">
        {/* Hero Header with Animated Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 15s ease infinite',
          }}
        >
          <style>{`
            @keyframes gradient-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          
          {/* Floating Decorations */}
          <div className="absolute top-4 right-8 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
          <div className="absolute top-12 right-24 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
          <div className="absolute bottom-4 left-8 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🎯</div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Main Progress Circle */}
            <div className="relative">
              <svg className="w-28 h-28 -rotate-90">
                <circle 
                  cx="56" cy="56" r="48" 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="10" 
                  fill="none" 
                />
                <motion.circle 
                  cx="56" cy="56" r="48" 
                  stroke="white" 
                  strokeWidth="10" 
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 302' }}
                  animate={{ strokeDasharray: `${getTotalProgress() * 3.02} 302` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{getTotalProgress()}%</span>
                <span className="text-xs text-white/80">Completo</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-8 h-8 text-white" />
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Checklists de Viagem
                </h1>
              </div>
              <p className="text-white/90 text-lg mb-4">
                Sua aventura mágica começa aqui! ✨
              </p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">
                    {getCompletedCategories()}/{Object.keys(checklistCategories).length} categorias
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">
                    {Object.values(checklistCategories).flatMap(c => c.items).filter(i => checkedItems[i.id]).length} itens
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Pills - Scrollable */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category]) => {
              const Icon = category.icon;
              const progress = getCategoryProgress(key);
              const isActive = activeCategory === key;
              const isComplete = progress === 100;
              
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(key)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-300 whitespace-nowrap',
                    isActive 
                      ? `bg-gradient-to-r ${category.color} border-transparent text-white shadow-lg` 
                      : isComplete
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-white'
                        : `${category.bgLight} ${category.borderColor} ${category.textColor} hover:shadow-md`
                  )}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="text-sm font-semibold">{category.title}</span>
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    isActive || isComplete ? 'bg-white/25' : 'bg-current/10'
                  )}>
                    {progress}%
                  </span>
                  {isComplete && !isActive && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Active Category Card */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn(
            'overflow-hidden border-2 shadow-xl',
            activeData.borderColor
          )}>
            {/* Category Header */}
            <div className={cn(
              'p-6 bg-gradient-to-r',
              activeData.color
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-3xl">{activeData.emoji}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      {activeData.title}
                    </h2>
                    <p className="text-white/80">
                      {activeData.items.filter(item => checkedItems[item.id]).length} de {activeData.items.length} itens
                    </p>
                  </div>
                </div>
                
                {/* Mini Progress */}
                <div className="hidden sm:block relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="none" />
                    <motion.circle 
                      cx="32" cy="32" r="26" 
                      stroke="white" 
                      strokeWidth="6" 
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 163' }}
                      animate={{ strokeDasharray: `${activeProgress * 1.63} 163` }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{activeProgress}%</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Items List */}
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {activeData.items.map((item, index) => {
                  const isChecked = checkedItems[item.id];
                  const isRecentlyChecked = recentlyChecked === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        'group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                        isChecked 
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-600' 
                          : `${activeData.bgLight} border-transparent hover:${activeData.borderColor}`,
                        isRecentlyChecked && 'ring-4 ring-emerald-400 ring-opacity-50'
                      )}
                    >
                      {/* Custom Animated Checkbox */}
                      <div className={cn(
                        'relative w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300',
                        isChecked 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-transparent' 
                          : `border-current ${activeData.textColor} group-hover:border-emerald-400`
                      )}>
                        <AnimatePresence>
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Label */}
                      <span className={cn(
                        'flex-1 font-medium transition-all duration-300',
                        isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>
                        {item.label}
                      </span>
                      
                      {/* Required Badge */}
                      {item.required && !isChecked && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Obrigatório
                        </Badge>
                      )}
                      
                      {/* Completed Animation */}
                      <AnimatePresence>
                        {isChecked && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Completion Message */}
              <AnimatePresence>
                {activeProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-lg font-bold">
                      <PartyPopper className="w-6 h-6" />
                      Parabéns! Categoria completa!
                      <PartyPopper className="w-6 h-6" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Overview - All Categories Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(checklistCategories) as [CategoryKey, typeof checklistCategories[CategoryKey]][]).map(([key, category]) => {
            const progress = getCategoryProgress(key);
            const isComplete = progress === 100;
            const isActive = activeCategory === key;
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden',
                  isActive 
                    ? `bg-gradient-to-br ${category.color} border-transparent text-white shadow-xl` 
                    : isComplete
                      ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-300 dark:border-emerald-700'
                      : `${category.bgLight} ${category.borderColor}`
                )}
              >
                {/* Background Emoji */}
                <span className="absolute -right-2 -bottom-2 text-5xl opacity-20">
                  {category.emoji}
                </span>
                
                <div className="relative z-10">
                  <span className="text-2xl">{category.emoji}</span>
                  <h3 className={cn(
                    'font-semibold text-sm mt-2 truncate',
                    isActive ? 'text-white' : category.textColor
                  )}>
                    {category.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn(
                      'flex-1 h-1.5 rounded-full overflow-hidden',
                      isActive ? 'bg-white/30' : 'bg-current/20'
                    )}>
                      <motion.div 
                        className={cn(
                          'h-full rounded-full',
                          isActive ? 'bg-white' : isComplete ? 'bg-emerald-500' : 'bg-current'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className={cn(
                      'text-xs font-bold',
                      isActive ? 'text-white' : category.textColor
                    )}>
                      {progress}%
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Checklists;
