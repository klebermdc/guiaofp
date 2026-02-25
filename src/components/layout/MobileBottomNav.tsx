import { memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PrefetchLink } from '@/components/PrefetchLink';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  Zap,
  MoreHorizontal,
  Map,
  MapPin,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageCircle,
  Headphones,
  Route,
  UtensilsCrossed,
  Star,
  Sparkles,
  Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNavSheet } from './MobileNavSheet';
import { usePlanPageAccess } from '@/hooks/usePlanPageAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelMode } from '@/contexts/TravelModeContext';
import { useUserRole } from '@/hooks/useUserRole';

// Icon mapping for dynamic menu
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
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
  Sparkles,
  Headphones,
  Route,
  UtensilsCrossed,
};

// Page key to path mapping
const pagePathMap: Record<string, string> = {
  dashboard: '/dashboard',
  perfil: '/perfil',
  multipass: '/multipass',
  agenda: '/agenda',
  mapa: '/mapa',
  atracoes: '/atracoes',
  roteiro: '/guiamento-remoto',
  guia: '/guia',
  checklists: '/checklists',
  restaurantes: '/restaurantes',
  roteiro_personalizado: '/roteiro-personalizado',
  planner_manual: '/planner-manual',
  conteudo: '/conteudos',
  contato: '/contato',
  cupons: '/cupons',
  resumo_orlando: '/resumo-orlando',
  guia_mini_viajante: '/guia-mini-viajante',
};


const MobileBottomNavComponent = () => {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { getSortedPages, isLoading } = usePlanPageAccess();
  const { planTier } = useAuth();
  const { isTravelMode } = useTravelMode();
  const { isGuide } = useUserRole();

  // Get sorted pages for mobile context, filtered to bottom nav items only
  const sortedPages = getSortedPages('mobile');
  
  const bottomNavItems = sortedPages
    .filter((page) => {
      // Only include items marked for bottom nav
      if (!page.show_in_bottom_nav) return false;
      // Guides see everything
      if (isGuide) return true;
      // In travel mode, check travel_mode_visible
      if (isTravelMode && !page.travel_mode_visible) return false;
      // Check visibility based on plan
      if (planTier === 'premium') return page.premium_visible;
      return page.basic_visible;
    })
    .slice(0, 4) // Max 4 items in bottom nav
    .map((page) => {
      const IconComponent = iconMap[page.page_icon] || LayoutDashboard;
      return {
        icon: IconComponent,
        label: page.page_name,
        path: pagePathMap[page.page_key] || `/${page.page_key}`,
        pageKey: page.page_key,
      };
    });

  // Fallback to default items while loading
  const navItems = isLoading || bottomNavItems.length === 0 
    ? [
        { icon: LayoutDashboard, label: 'Início', path: '/dashboard', pageKey: 'dashboard' },
        { icon: User, label: 'Perfil', path: '/perfil', pageKey: 'perfil' },
        { icon: Zap, label: 'Multi Pass', path: '/multipass', pageKey: 'multipass' },
        { icon: Calendar, label: 'Agenda', path: '/agenda', pageKey: 'agenda' },
      ]
    : bottomNavItems;

  return (
    <>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-area-pb"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex items-center justify-around h-14 sm:h-16 px-1 sm:px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <PrefetchLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl min-w-[52px] sm:min-w-[60px] min-h-[44px]"
              >
                <motion.div 
                  className={cn(
                    "p-1.5 rounded-xl transition-colors duration-200",
                    isActive 
                      ? "text-sidebar-primary bg-sidebar-primary/20" 
                      : "text-sidebar-foreground/60"
                  )}
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? { 
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.3 }
                  } : {}}
                >
                  <item.icon size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <motion.span 
                  className={cn(
                    "text-[9px] sm:text-[10px] font-medium transition-colors duration-200 truncate max-w-[56px] sm:max-w-none",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                  )}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  {item.label}
                </motion.span>
              </PrefetchLink>
            );
          })}
          
          {/* More button */}
          <motion.button
            onClick={() => setIsSheetOpen(true)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl text-sidebar-foreground/60 min-w-[52px] sm:min-w-[60px] min-h-[44px]"
          >
            <div className="p-1.5 rounded-xl">
              <MoreHorizontal size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium">Mais</span>
          </motion.button>
        </div>
      </motion.nav>

      <MobileNavSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export const MobileBottomNav = memo(MobileBottomNavComponent);
