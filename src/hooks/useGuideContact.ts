import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GUIDE_WHATSAPP: Record<string, string> = {
  'rafael': 'https://wa.me/5511966144493',
  'kleber': 'https://wa.me/message/SKJOMENE3AQKD1',
};

export type PlanTier = 'basic' | 'premium';

export const useGuideContact = () => {
  const { travelProfile } = useAuth();

  return useMemo(() => {
    // Normalize guide name to lowercase and trim for matching
    const rawGuideName = travelProfile.guideName || '';
    const normalizedName = rawGuideName.toLowerCase().trim();
    const whatsappUrl = GUIDE_WHATSAPP[normalizedName] || '';
    
    // User has guide if they have a valid guide name with a matching WhatsApp
    const hasGuide = !!whatsappUrl && !!normalizedName;
    
    // Plan tier based on guide status
    const planTier: PlanTier = hasGuide ? 'premium' : 'basic';

    return {
      guideName: rawGuideName,
      whatsappUrl,
      hasGuide,
      planTier,
    };
  }, [travelProfile.guideName]);
};
