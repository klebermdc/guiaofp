import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  CreditCard, 
  Star,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
  { icon: User, label: 'Perfil da Viagem', path: '/perfil' },
  { icon: Calendar, label: 'Agenda do Guiamento', path: '/agenda' },
  { icon: MessageCircle, label: 'Falar com Guia', path: '/contato' },
  { icon: BookOpen, label: 'Conteúdos Exclusivos', path: '/conteudos' },
  { icon: CreditCard, label: 'Meu Plano', path: '/plano' },
  { icon: Star, label: 'Pós-Viagem', path: '/pos-viagem' },
];

const guideMenuItems = [
  { icon: Shield, label: 'Painel do Guia', path: '/admin' },
];

export const AppSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isGuide } = useUserRole();

  const allMenuItems = isGuide ? [...menuItems, ...guideMenuItems] : menuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2 rounded-lg shadow-card"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-sidebar-primary">
                  Orlando Fast Pass
                </h1>
                <p className="text-xs text-sidebar-foreground/70">Guiamento Remoto</p>
              </div>
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
            {allMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
