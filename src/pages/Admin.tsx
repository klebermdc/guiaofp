import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { Shield } from 'lucide-react';

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
          <div className="text-muted-foreground">Carregando...</div>
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie clientes e conteúdos</p>
          </div>
        </div>

        <AdminTabs />
      </div>
    </AppLayout>
  );
};

export default Admin;
