import { NavLink } from 'react-router-dom';
import { 
  Ticket,
  MapPin,
  BookOpen,
  MessageCircle,
  Sparkles,
  CreditCard,
  Star,
  LogOut,
  Shield,
  X,
  Headphones,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  User,
  Zap,
  Map,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlanPageAccess } from '@/hooks/usePlanPageAccess';
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
  CreditCard,
  Headphones,
};

// Page key to path and label mapping
const pageConfig: Record<string, { path: string; label: string; defaultIcon: React.ElementType }> = {
  dashboard: { path: '/dashboard', label: 'Início', defaultIcon: LayoutDashboard },
  perfil: { path: '/perfil', label: 'Perfil da Viagem', defaultIcon: User },
  atracoes: { path: '/atracoes', label: 'Atrações Desejadas', defaultIcon: Ticket },
  agenda: { path: '/agenda', label: 'Agenda do Guiamento', defaultIcon: Calendar },
  roteiro: { path: '/guiamento-remoto', label: 'Guiamento Remoto', defaultIcon: Headphones },
  mapa: { path: '/mapa', label: 'Mapa do Parque', defaultIcon: MapPin },
  multipass: { path: '/multipass', label: 'Multi Pass', defaultIcon: Zap },
  guia: { path: '/guia', label: 'Guia de Viagem', defaultIcon: BookOpen },
  checklists: { path: '/checklists', label: 'Checklists', defaultIcon: CheckCircle2 },
  conteudo: { path: '/conteudos', label: 'Conteúdos Exclusivos', defaultIcon: Sparkles },
  contato: { path: '/contato', label: 'Falar com Guia', defaultIcon: MessageCircle },
};

// Static menu items (not controlled by plan_page_access)
const staticMenuItems = [
  { icon: CreditCard, label: 'Meu Plano', path: '/plano', pageKey: 'plano' },
  { icon: Star, label: 'Pós-Viagem', path: '/pos-viagem', pageKey: 'pos-viagem' },
];

const guideMenuItems = [
  { icon: Headphones, label: 'Meus Clientes', path: '/guia-dashboard' },
  { icon: Shield, label: 'Configurações', path: '/admin' },
];

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavSheet = ({ open, onOpenChange }: MobileNavSheetProps) => {
  const { user, logout, planTier } = useAuth();
  const { isGuide } = useUserRole();
  const { pageAccess, isLoading } = usePlanPageAccess();

  // Build dynamic menu based on plan_page_access table (excluding bottom nav items)
  const bottomNavKeys = ['dashboard', 'perfil', 'multipass', 'agenda'];
  const dynamicMenuItems = pageAccess
    .filter((page) => {
      // Skip items already in bottom nav
      if (bottomNavKeys.includes(page.page_key)) return false;
      // Guides see everything
      if (isGuide) return true;
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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-sidebar border-sidebar-border px-0">
        <SheetHeader className="px-6 pb-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <img 
              src={logo} 
              alt="Orlando Fast Pass" 
              className="h-10 object-contain"
            />
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-sidebar-accent transition-colors"
            >
              <X size={20} className="text-sidebar-foreground/70" />
            </button>
          </div>
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        </SheetHeader>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-magic flex items-center justify-center text-accent-foreground font-bold text-lg">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sidebar-foreground truncate">
                {user?.user_metadata?.name || 'Visitante'}
              </p>
              <p className="text-sm text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sidebar-foreground/30 border-t-sidebar-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {allItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) => cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary/20 border-sidebar-primary/40 text-sidebar-primary"
                      : "bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <item.icon size={24} />
                  <span className="text-sm font-medium text-center leading-tight">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <button
            onClick={() => {
              logout();
              onOpenChange(false);
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair da conta</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
