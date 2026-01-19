import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  MessageCircle, 
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MobileNavSheet } from './MobileNavSheet';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: Zap, label: 'Multi Pass', path: '/multipass' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar border-t border-sidebar-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/60"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive && "bg-sidebar-primary/20"
                )}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-sidebar-primary"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
          
          {/* More button */}
          <button
            onClick={() => setIsSheetOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-sidebar-foreground/60 min-w-[60px]"
          >
            <div className="p-1.5 rounded-xl">
              <MoreHorizontal size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>

      <MobileNavSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};
