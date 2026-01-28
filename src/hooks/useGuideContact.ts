import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GUIDE_WHATSAPP: Record<string, string> = {
  'rafael': 'https://wa.me/5511966144493',
  'kleber': 'https://wa.me/message/SKJOMENE3AQKD1',
};

// Default WhatsApp for when no specific guide is assigned
const DEFAULT_WHATSAPP = 'https://wa.me/5511966144493';

export type PlanTier = 'basic' | 'premium';

export const useGuideContact = () => {
  const { travelProfile } = useAuth();

  return useMemo(() => {
    // Normalize guide name to lowercase and trim for matching
    const rawGuideName = travelProfile.guideName || '';
    const normalizedName = rawGuideName.toLowerCase().trim();
    
    // Get specific guide WhatsApp or use default
    const specificWhatsApp = GUIDE_WHATSAPP[normalizedName];
    const whatsappUrl = specificWhatsApp || DEFAULT_WHATSAPP;
    
    // User has guide if they have a valid guide name with a matching WhatsApp
    const hasGuide = !!specificWhatsApp && !!normalizedName;
    
    // Plan tier based on guide status
    const planTier: PlanTier = hasGuide ? 'premium' : 'basic';

    return {
      guideName: rawGuideName || 'Guia',
      whatsappUrl,
      hasGuide: true, // Always show WhatsApp button (with default link if no guide)
      planTier,
      hasSpecificGuide: hasGuide,
    };
  }, [travelProfile.guideName]);
};
