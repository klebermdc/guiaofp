import { useAuth } from '@/contexts/AuthContext';

const GUIDE_WHATSAPP: Record<string, string> = {
  'rafael': 'https://wa.me/5511966144493',
  'kleber': 'https://wa.me/message/SKJOMENE3AQKD1',
};

export const useGuideContact = () => {
  const { travelProfile } = useAuth();

  // Normalize guide name to lowercase and trim for matching
  const rawGuideName = travelProfile.guideName || '';
  const normalizedName = rawGuideName.toLowerCase().trim();
  const whatsappUrl = GUIDE_WHATSAPP[normalizedName] || '';
  const hasGuide = !!whatsappUrl;

  return {
    guideName: rawGuideName,
    whatsappUrl,
    hasGuide,
  };
};
