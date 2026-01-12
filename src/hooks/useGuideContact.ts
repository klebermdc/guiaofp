import { useAuth } from '@/contexts/AuthContext';

const GUIDE_PHONES: Record<string, string> = {
  'rafael': '5511966144493',
  'kleber': '551151944192',
};

export const useGuideContact = () => {
  const { travelProfile } = useAuth();

  const guideName = travelProfile.guideName?.toLowerCase() || '';
  const guidePhone = GUIDE_PHONES[guideName] || '';
  const whatsappUrl = guidePhone ? `https://wa.me/${guidePhone}` : '';
  const hasGuide = !!guidePhone;

  return {
    guideName: travelProfile.guideName || '',
    guidePhone,
    whatsappUrl,
    hasGuide,
  };
};
