import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const GUIDE_PHONES: Record<string, string> = {
  'rafael': '5511966144493',
  'kleber': '5511951944192',
};

export const useGuideContact = () => {
  const { user } = useAuth();

  const { data: contract } = useQuery({
    queryKey: ['contract-guide', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select('guide_name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const guideName = contract?.guide_name?.toLowerCase() || '';
  const guidePhone = GUIDE_PHONES[guideName] || '5511966144493'; // Default para Rafael
  const whatsappUrl = `https://wa.me/${guidePhone}`;

  return {
    guideName: contract?.guide_name || 'Guia',
    guidePhone,
    whatsappUrl,
  };
};
