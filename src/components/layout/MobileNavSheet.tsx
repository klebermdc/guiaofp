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
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

// Items available for all plans
const baseMenuItems = [
  { icon: Ticket, label: 'Atrações Desejadas', path: '/atracoes' },
  { icon: CheckCircle2, label: 'Checklists', path: '/checklists' },
  { icon: MapPin, label: 'Mapa do Parque', path: '/mapa' },
  { icon: BookOpen, label: 'Guia de Viagem', path: '/guia' },
  { icon: Sparkles, label: 'Conteúdos Exclusivos', path: '/conteudos' },
  { icon: CreditCard, label: 'Meu Plano', path: '/plano' },
  { icon: Star, label: 'Pós-Viagem', path: '/pos-viagem' },
];

// Items only for premium plan (with guide)
const premiumMenuItems = [
  { icon: Headphones, label: 'Guiamento Remoto', path: '/guiamento-remoto' },
  { icon: Calendar, label: 'Agenda do Guiamento', path: '/agenda' },
  { icon: MessageCircle, label: 'Falar com Guia', path: '/contato' },
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

  // Build menu items based on plan tier
  const menuItems = planTier === 'premium' || isGuide
    ? [...baseMenuItems.slice(0, 2), ...premiumMenuItems, ...baseMenuItems.slice(2)]
    : baseMenuItems;

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
