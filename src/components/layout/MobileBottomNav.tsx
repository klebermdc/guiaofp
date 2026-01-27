import { memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PrefetchLink } from '@/components/PrefetchLink';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNavSheet } from './MobileNavSheet';

// These are the main nav items for clients - guides will be redirected from /dashboard
const mainNavItems = [
  { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: Zap, label: 'Multi Pass', path: '/multipass' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
];

const MobileBottomNavComponent = () => {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-area-pb"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <PrefetchLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[60px]"
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
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <motion.span 
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
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
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-sidebar-foreground/60 min-w-[60px]"
          >
            <div className="p-1.5 rounded-xl">
              <MoreHorizontal size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium">Mais</span>
          </motion.button>
        </div>
      </motion.nav>

      <MobileNavSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export const MobileBottomNav = memo(MobileBottomNavComponent);
