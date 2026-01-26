import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { OrlandoAssistant } from '@/components/chat/OrlandoAssistant';
import { TravelModeFloatingButton } from '@/components/travel-mode/TravelModeFloatingButton';

interface AppLayoutProps {
  children: ReactNode;
}

// Page transition variants
const pageVariants = {
  initial: { 
    opacity: 0,
    y: 8
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2
    }
  }
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, isAccessEnabled, isLoading, isProfileLoaded } = useAuth();
  const { isGuide, isLoading: isRoleLoading } = useUserRole();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for auth, role, AND profile to load before making access decisions
  if (isLoading || isRoleLoading || !isProfileLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-8 w-8 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Guides and admins always have access, clients need explicit access
  if (!isAccessEnabled && !isGuide) {
    return <Navigate to="/acesso-bloqueado" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileBottomNav />
      <main className="lg:ml-72 min-h-screen pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-4 pt-4 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <TravelModeFloatingButton />
      <OrlandoAssistant />
    </div>
  );
};
