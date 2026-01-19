import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppSidebar } from './AppSidebar';
import { OrlandoAssistant } from '@/components/chat/OrlandoAssistant';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, isAccessEnabled, isLoading } = useAuth();
  const { isGuide, isLoading: isRoleLoading } = useUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for both auth and role to load
  if (isLoading || isRoleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 pt-4 lg:p-8">
          {children}
        </div>
      </main>
      <OrlandoAssistant />
    </div>
  );
};
