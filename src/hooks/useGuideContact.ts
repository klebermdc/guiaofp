import { useAuth } from '@/contexts/AuthContext';

const GUIDE_WHATSAPP: Record<string, string> = {
  'rafael': 'https://wa.me/5511966144493',
  'kleber': 'https://wa.me/message/SKJOMENE3AQKD1',
};

export const useGuideContact = () => {
  const { travelProfile } = useAuth();

  const guideName = travelProfile.guideName?.toLowerCase() || '';
  const whatsappUrl = GUIDE_WHATSAPP[guideName] || '';
  const hasGuide = !!whatsappUrl;

  return {
    guideName: travelProfile.guideName || '',
    whatsappUrl,
    hasGuide,
  };
};
