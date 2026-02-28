import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PrefetchLink } from '@/components/PrefetchLink';
import { 
  Ticket,
  MapPin,
  BookOpen,
  MessageCircle,
  FerrisWheel,
  CreditCard,
  Star,
  LogOut,
  Shield,
  X,
  Headphones,
  CheckCircle2,
  Calendar,
  Home,
  User,
  Zap,
  Map,
  FileText,
  Route,
  UtensilsCrossed,
  Wallet,
  Sparkles,
  Hotel,
  Car
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlanPageAccess } from '@/hooks/usePlanPageAccess';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTravelMode } from '@/contexts/TravelModeContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

// Icon mapping for dynamic menu
const iconMap: Record<string, React.ElementType> = {
  Home,
  User,
  Star,
  Calendar,
  Map,
  MapPin,
  Zap,
  BookOpen,
  CheckSquare: CheckCircle2,
  FileText,
  MessageCircle,
  Ticket,
  Sparkles: FerrisWheel,
  CreditCard,
  Headphones,
  Route,
  UtensilsCrossed,
};

// Page key to path and label mapping
const pageConfig: Record<string, { path: string; label: string; defaultIcon: React.ElementType }> = {
  dashboard: { path: '/dashboard', label: 'Início', defaultIcon: Home },
  perfil: { path: '/perfil', label: 'Perfil da Viagem', defaultIcon: User },
  atracoes: { path: '/atracoes', label: 'Atrações Desejadas', defaultIcon: Ticket },
  agenda: { path: '/agenda', label: 'Agenda do Guiamento', defaultIcon: Calendar },
  roteiro: { path: '/guiamento-remoto', label: 'Guiamento Remoto', defaultIcon: Headphones },
  mapa: { path: '/mapa', label: 'Mapa do Parque', defaultIcon: MapPin },
  multipass: { path: '/multipass', label: 'Multi Pass', defaultIcon: Zap },
  guia: { path: '/guia', label: 'Guia de Viagem', defaultIcon: BookOpen },
  checklists: { path: '/checklists', label: 'Checklists', defaultIcon: CheckCircle2 },
  restaurantes: { path: '/restaurantes', label: 'Restaurantes', defaultIcon: UtensilsCrossed },
  roteiro_personalizado: { path: '/roteiro-personalizado', label: 'Roteiro Personalizado', defaultIcon: Route },
  planner_manual: { path: '/planner-manual', label: 'Planejador Manual', defaultIcon: Calendar },
  conteudo: { path: '/conteudos', label: 'Guia dos Parques', defaultIcon: FerrisWheel },
  contato: { path: '/contato', label: 'Falar com Guia', defaultIcon: MessageCircle },
  cupons: { path: '/cupons', label: 'Cupons de Parceiros', defaultIcon: Ticket },
};

// Static menu items (not controlled by plan_page_access)
const staticMenuItems = [
  { icon: Sparkles, label: 'Top 3 nos Parques', path: '/top3', pageKey: 'top3' },
  { icon: Hotel, label: 'Comparador de Hotéis', path: '/hoteis', pageKey: 'hoteis' },
  { icon: Car, label: 'Guia de Transporte', path: '/transporte', pageKey: 'transporte' },
  { icon: Wallet, label: 'Carteira de Documentos', path: '/carteira', pageKey: 'carteira' },
  { icon: Star, label: 'Pós-Viagem', path: '/pos-viagem', pageKey: 'pos-viagem' },
];

const guideMenuItems = [
  { icon: Headphones, label: 'Meus Clientes', path: '/guia-dashboard' },
  { icon: Shield, label: 'Configurações', path: '/admin' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavSheet = ({ open, onOpenChange }: MobileNavSheetProps) => {
  const navigate = useNavigate();
  const { user, logout, planTier } = useAuth();
  const { isGuide } = useUserRole();
  const { getSortedPages, isTravelModeVisible, isLoading } = usePlanPageAccess();
  const { t } = useLanguage();
  const { isTravelMode } = useTravelMode();

  // Build dynamic menu based on plan_page_access table (excluding bottom nav items)
  const bottomNavKeys = ['dashboard', 'perfil', 'multipass', 'agenda'];
  const sortedPages = getSortedPages('mobile');
  
  const dynamicMenuItems = sortedPages
    .filter((page) => {
      // Skip items already in bottom nav
      if (bottomNavKeys.includes(page.page_key)) return false;
      // Guides see everything
      if (isGuide) return true;
      // In travel mode, also check travel_mode_visible
      if (isTravelMode && !page.travel_mode_visible) return false;
      // Check visibility based on plan
      if (planTier === 'premium') return page.premium_visible;
      return page.basic_visible;
    })
    .map((page) => {
      const config = pageConfig[page.page_key];
      const IconComponent = iconMap[page.page_icon] || config?.defaultIcon || FileText;
      return {
        icon: IconComponent,
        label: config?.label || page.page_name,
        path: config?.path || `/${page.page_key}`,
        pageKey: page.page_key,
      };
    });

  // Combine dynamic items with static items
  const menuItems = [...dynamicMenuItems, ...staticMenuItems];
  const allItems = isGuide ? [...menuItems, ...guideMenuItems] : menuItems;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" hideCloseButton className="h-[80vh] max-h-[80vh] rounded-t-3xl bg-sidebar/95 backdrop-blur-xl border-sidebar-border px-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-4 sm:px-6 pb-3 sm:pb-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <motion.img 
              src={logo} 
              alt="Orlando Fast Pass" 
              className="h-8 sm:h-10 object-contain"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            />
            <motion.button 
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-sidebar-accent transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.15 }}
            >
              <X size={20} className="text-sidebar-foreground/70" />
            </motion.button>
          </div>
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        </SheetHeader>

        {/* User Info */}
        <motion.div 
          className="px-4 sm:px-6 py-3 sm:py-4 border-b border-sidebar-border flex-shrink-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-magic flex items-center justify-center text-accent-foreground font-bold text-base sm:text-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.25 }}
            >
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sidebar-foreground truncate text-sm sm:text-base">
                {user?.user_metadata?.name || 'Visitante'}
              </p>
              <p className="text-xs sm:text-sm text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 overscroll-contain">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div 
                className="h-6 w-6 rounded-full border-2 border-sidebar-foreground/30 border-t-sidebar-foreground"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 gap-2 sm:gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {allItems.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <PrefetchLink
                    to={item.path}
                    onClick={() => onOpenChange(false)}
                    className={({ isActive }) => cn(
                      "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-colors duration-200 min-h-[72px] sm:min-h-[88px]",
                      isActive
                        ? "bg-sidebar-primary/20 border-sidebar-primary/40 text-sidebar-primary"
                        : "bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground"
                    )}
                  >
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <item.icon size={20} className="sm:w-6 sm:h-6" />
                    </motion.div>
                    <span className="text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2">{item.label}</span>
                  </PrefetchLink>
                </motion.div>
              ))}
            </motion.div>
          )}
        </nav>

        {/* Language Selector */}
        <motion.div 
          className="px-4 sm:px-6 py-2 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <LanguageSelector />
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          className="px-4 sm:px-6 py-3 sm:py-4 border-t border-sidebar-border flex-shrink-0 safe-area-pb"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={async () => {
              await logout();
              onOpenChange(false);
              navigate('/login');
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors min-h-[44px]"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('common.logout')}</span>
          </motion.button>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};
