import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'guide' | 'client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!isMounted) return;
        
        if (!error && data) {
          setRoles(data.map((r) => r.role as AppRole));
        }
      } catch (err) {
        console.error('Error fetching user roles:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRoles();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const isGuide = roles.includes('guide') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return { roles, isGuide, isAdmin, isLoading };
};
