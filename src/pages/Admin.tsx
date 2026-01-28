import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Shield, Sparkles } from 'lucide-react';

const Admin = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isGuide, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!roleLoading && !isGuide) {
      navigate('/dashboard');
    }
  }, [roleLoading, isGuide, navigate]);

  if (authLoading || roleLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isGuide) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
                <Sparkles className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-muted-foreground">
                Central de gerenciamento do Orlando Fast Pass
              </p>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <AdminPanel />
      </div>
    </AppLayout>
  );
};

export default Admin;
