interface OpenExternalUrlOptions {
  preferSameTab?: boolean;
  preferSameTabOnMobile?: boolean;
}

const isPreviewLikeEnvironment = () => {
  const hostname = window.location.hostname;
  const isPreviewHost =
    hostname.includes('id-preview--') ||
    hostname.includes('lovableproject.com');

  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch {
    isInIframe = true;
  }

  return isPreviewHost || isInIframe;
};

const isStandaloneDisplayMode = () =>
  ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) ||
  (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches);

export function openExternalUrl(url: string, options: OpenExternalUrlOptions = {}) {
  if (typeof window === 'undefined' || !url) return;

  const { preferSameTab = false, preferSameTabOnMobile = false } = options;
  const shouldUseSameTab =
    !isPreviewLikeEnvironment() &&
    (
      preferSameTab ||
      (preferSameTabOnMobile && (window.innerWidth < 768 || isStandaloneDisplayMode()))
    );

  if (shouldUseSameTab) {
    window.location.assign(url);
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}