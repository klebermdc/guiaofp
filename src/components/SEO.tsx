import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'Orlando Fast Pass Planejador - Roteiros Inteligentes para Parques';
const DEFAULT_DESCRIPTION = 'Planeje sua viagem para os parques de Orlando com roteiros inteligentes. Menos filas, mais magia!';
const DEFAULT_IMAGE = 'https://ofpplanejador.com/logo-512.png';
const BASE_URL = 'https://ofpplanejador.com';

/**
 * SEO component for managing page metadata
 * Updates document title and meta tags dynamically
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const pageTitle = title ? `${title} | Orlando Fast Pass` : DEFAULT_TITLE;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const pageImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attribute = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        const [attr, value] = selector.replace(/[[\]']/g, '').split('=');
        element.setAttribute(attr.replace('meta', '').trim(), value?.replace(/"/g, '') || '');
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // Update standard meta tags
    updateMetaTag('meta[name="description"]', description);
    
    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', pageTitle);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', pageUrl);
    updateMetaTag('meta[property="og:image"]', pageImage);
    
    // Update Twitter tags
    updateMetaTag('meta[name="twitter:title"]', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', pageImage);

    // Handle noIndex
    if (noIndex) {
      updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }

    // Cleanup function
    return () => {
      // Reset to defaults when component unmounts (optional)
      // document.title = DEFAULT_TITLE;
    };
  }, [pageTitle, description, pageUrl, pageImage, type, noIndex]);

  return null; // This component doesn't render anything
}

// Pre-defined SEO configurations for common pages
export const SEO_PAGES = {
  dashboard: {
    title: 'Dashboard',
    description: 'Seu painel de controle para planejar a viagem perfeita para Orlando.',
  },
  profile: {
    title: 'Perfil de Viagem',
    description: 'Configure seu perfil de viagem e preferências para os parques de Orlando.',
  },
  map: {
    title: 'Mapa dos Parques',
    description: 'Mapa interativo com tempos de espera em tempo real e pontos de interesse.',
  },
  attractions: {
    title: 'Atrações',
    description: 'Descubra as melhores atrações dos parques de Orlando e planeje seu roteiro.',
  },
  restaurants: {
    title: 'Restaurantes',
    description: 'Encontre os melhores restaurantes nos parques de Orlando com dicas e avaliações.',
  },
  multipass: {
    title: 'Lightning Lane Multipass',
    description: 'Tutorial completo sobre como usar o Lightning Lane Multi Pass da Disney.',
  },
  guide: {
    title: 'Guia de Viagem',
    description: 'Seu guia completo para aproveitar ao máximo os parques de Orlando.',
  },
  agenda: {
    title: 'Agenda',
    description: 'Visualize e gerencie seu roteiro dia a dia nos parques de Orlando.',
  },
  checklists: {
    title: 'Checklists',
    description: 'Listas de verificação para garantir que você não esqueça nada na sua viagem.',
  },
  login: {
    title: 'Login',
    description: 'Acesse sua conta do Orlando Fast Pass Planejador.',
    noIndex: true,
  },
  admin: {
    title: 'Painel Administrativo',
    description: 'Gerencie clientes, conteúdos e configurações.',
    noIndex: true,
  },
} as const;
