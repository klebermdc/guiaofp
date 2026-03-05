import { ReactNode, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { OrlandoAssistant } from '@/components/chat/OrlandoAssistant';
import { AuthLoadingScreen } from './AuthLoadingScreen';

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
  const { isAuthenticated, isAccessEnabled, isLoading, isProfileLoading } = useAuth();
  const { isGuide, isAdmin, isLoading: isRoleLoading } = useUserRole();
  const location = useLocation();

  // Track if we've ever been authenticated to prevent redirect on tab switch
  const wasAuthenticatedRef = useRef(false);
  
  if (isAuthenticated) {
    wasAuthenticatedRef.current = true;
  }

  // Only show loading if we're truly in an initial auth check (not returning from login)
  const showLoading = isLoading || (isRoleLoading && !isAuthenticated);

  // Only redirect to login if NEVER authenticated and auth check is done
  // This prevents redirect flicker when switching tabs
  if (!isAuthenticated && !isLoading && !wasAuthenticatedRef.current) {
    return <Navigate to="/login" replace />;
  }

  // During initial auth check, show loading
  if (showLoading) {
    return <AuthLoadingScreen />;
  }

  // CRITICAL: After initial load, NEVER unmount children for background profile refreshes.
  // Only show loading screen if we haven't loaded yet (first time).
  if ((isProfileLoading || isRoleLoading) && !wasAuthenticatedRef.current) {
    return <AuthLoadingScreen />;
  }

  // Guides and admins always have access, clients need explicit access
  // CRITICAL: Wait for profile to finish loading before checking access
  // Otherwise default isAccessEnabled=false causes premature redirect
  if (!isAccessEnabled && !isGuide && !isProfileLoading) {
    return <Navigate to="/acesso-bloqueado" replace />;
  }

  return (
    <div className="min-h-screen bg-background safe-area-top">
      <AppSidebar />
      <MobileBottomNav />
      <main 
        className="lg:ml-72 min-h-screen lg:pb-0"
        style={{ 
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 5rem), 5rem)' 
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-3 py-4 sm:px-4 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <OrlandoAssistant />
    </div>
  );
};
