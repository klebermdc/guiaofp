import { memo, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PrefetchLink } from '@/components/PrefetchLink';
import { Sparkles } from 'lucide-react';
import { 
  Home, 
  User, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  CreditCard, 
  Star,
  LogOut,
  Shield,
  MapPin,
  Ticket,
  FerrisWheel,
  Zap,
  Headphones,
  CheckCircle2,
  Map,
  FileText,
  UtensilsCrossed,
  Route,
  Heart,
  Wallet,
  Baby
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlanPageAccess, type SortContext } from '@/hooks/usePlanPageAccess';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTravelMode } from '@/contexts/TravelModeContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

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
  UtensilsCrossed,
  Route,
  Heart,
  Baby,
};

// Static menu items (not controlled by plan_page_access)
const staticMenuItems = [
  { icon: Sparkles, label: 'Top 3 nos Parques', path: '/top3', pageKey: 'top3' },
  { icon: Wallet, label: 'Carteira de Documentos', path: '/carteira', pageKey: 'carteira' },
  { icon: Heart, label: 'Meus Favoritos', path: '/favoritos', pageKey: 'favoritos' },
  { icon: Star, label: 'Pós-Viagem', path: '/pos-viagem', pageKey: 'pos-viagem' },
];

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
  restaurantes: { path: '/guia-restaurantes', label: 'Guia de Restaurantes', defaultIcon: UtensilsCrossed },
  roteiro_personalizado: { path: '/roteiro-personalizado', label: 'Roteiro Personalizado', defaultIcon: Route },
  planner_manual: { path: '/planner-manual', label: 'Planejador Manual', defaultIcon: Calendar },
  conteudo: { path: '/conteudos', label: 'Guia dos Parques', defaultIcon: FerrisWheel },
  contato: { path: '/contato', label: 'Falar com Guia', defaultIcon: MessageCircle },
  cupons: { path: '/cupons', label: 'Cupons de Parceiros', defaultIcon: Ticket },
  resumo_orlando: { path: '/resumo-orlando', label: 'Resumo de Orlando', defaultIcon: Map },
  guia_mini_viajante: { path: '/guia-mini-viajante', label: 'Guia Criança OFP', defaultIcon: Baby },
};

const guideMenuItems = [
  { icon: Headphones, label: 'Meus Clientes', path: '/guia-dashboard' },
  { icon: Shield, label: 'Configurações', path: '/admin' },
];

const AppSidebarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, planTier } = useAuth();
  const { isGuide } = useUserRole();
  const { pageAccess, isLoading, getSortedPages, isTravelModeVisible } = usePlanPageAccess();
  const { t } = useLanguage();
  const { isTravelMode } = useTravelMode();
  const isMobile = useIsMobile();

  // Determine sort context
  const sortContext: SortContext = isTravelMode ? 'travel_mode' : (isMobile ? 'mobile' : 'desktop');

  // Build dynamic menu based on plan_page_access table - memoized to prevent recalculations
  const dynamicMenuItems = useMemo(() => {
    const sortedPages = getSortedPages(sortContext);
    
    return sortedPages
      .filter((page) => {
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
  }, [pageAccess, isGuide, planTier, sortContext, isTravelMode, getSortedPages]);

  // Combine dynamic items with static items
  const allMenuItems = useMemo(() => {
    const menuItems = [...dynamicMenuItems, ...staticMenuItems];
    return isGuide ? [...menuItems, ...guideMenuItems] : menuItems;
  }, [dynamicMenuItems, isGuide]);

  return (
    <>
      {/* Desktop Sidebar Only - with safe area support */}
      <aside 
        className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground z-50 safe-area-top safe-area-left"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-center">
              <img 
                src={logo} 
                alt="Orlando Fast Pass Planejador" 
                className="w-48 h-auto object-contain"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-magic flex items-center justify-center text-accent-foreground font-semibold">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.user_metadata?.name || 'Visitante'}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-sidebar-foreground/30 border-t-sidebar-foreground" />
              </div>
            ) : (
              allMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <PrefetchLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </PrefetchLink>
                );
              })
            )}
          </nav>

          {/* Language Selector */}
          <div className="px-4 pb-2">
            <LanguageSelector />
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={20} />
              <span>{t('common.logout')}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const AppSidebar = memo(AppSidebarComponent);
