import { useCallback } from 'react';

// Map routes to their lazy-loaded module paths
const routeModules: Record<string, () => Promise<unknown>> = {
  '/guia-dashboard': () => import('@/pages/GuideDashboard'),
  '/perfil': () => import('@/pages/TravelProfile'),
  '/agenda': () => import('@/pages/Agenda'),
  '/contato': () => import('@/pages/Contact'),
  '/conteudos': () => import('@/pages/Content'),
  '/plano': () => import('@/pages/Plan'),
  '/pos-viagem': () => import('@/pages/PostTrip'),
  '/admin': () => import('@/pages/Admin'),
  '/mapa': () => import('@/pages/ParkMap'),
  '/guia': () => import('@/pages/TravelGuide'),
  '/atracoes': () => import('@/pages/Attractions'),
  '/multipass': () => import('@/pages/MultiPass'),
  '/guiamento-remoto': () => import('@/pages/RemoteGuidance'),
  '/checklists': () => import('@/pages/Checklists'),
  '/restaurantes': () => import('@/pages/Restaurants'),
  '/checkout': () => import('@/pages/Checkout'),
  '/favoritos': () => import('@/pages/Favorites'),
  '/guia-restaurantes': () => import('@/pages/RestaurantsGuide'),
  '/roteiro-personalizado': () => import('@/pages/RoteiroPersonalizado'),
  '/planner-manual': () => import('@/pages/PlannerManual'),
};

// Track which routes have been prefetched to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

export function usePrefetch() {
  const prefetch = useCallback((path: string) => {
    // Normalize path (remove query params and trailing slashes)
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
    
    // Skip if already prefetched or not a lazy route
    if (prefetchedRoutes.has(normalizedPath)) return;
    
    // Check for dynamic routes like /checkout/:id
    const basePath = normalizedPath.split('/').slice(0, 2).join('/');
    const moduleLoader = routeModules[normalizedPath] || routeModules[basePath];
    
    if (moduleLoader) {
      prefetchedRoutes.add(normalizedPath);
      // Use requestIdleCallback for non-blocking prefetch
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          moduleLoader().catch(() => {
            // Remove from set if prefetch fails so it can retry
            prefetchedRoutes.delete(normalizedPath);
          });
        }, { timeout: 2000 });
      } else {
        // Fallback for Safari
        setTimeout(() => {
          moduleLoader().catch(() => {
            prefetchedRoutes.delete(normalizedPath);
          });
        }, 100);
      }
    }
  }, []);

  return { prefetch };
}

// Utility to prefetch multiple routes at once
export function prefetchRoutes(paths: string[]) {
  paths.forEach(path => {
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
    if (prefetchedRoutes.has(normalizedPath)) return;
    
    const basePath = normalizedPath.split('/').slice(0, 2).join('/');
    const moduleLoader = routeModules[normalizedPath] || routeModules[basePath];
    
    if (moduleLoader) {
      prefetchedRoutes.add(normalizedPath);
      moduleLoader().catch(() => {
        prefetchedRoutes.delete(normalizedPath);
      });
    }
  });
}
