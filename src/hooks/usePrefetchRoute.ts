import { useEffect } from 'react';

// Polyfill for Safari which doesn't support requestIdleCallback
const safeRequestIdleCallback = (callback: () => void, options?: { timeout?: number }) => {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout for Safari
  return setTimeout(callback, options?.timeout || 1);
};

/**
 * Prefetch route components on hover/focus for instant navigation
 */
export const usePrefetchRoute = () => {
  useEffect(() => {
    // Prefetch likely routes based on user behavior
    const prefetchOnHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link || !link.href) return;
      
      try {
        const url = new URL(link.href);
        if (url.origin !== window.location.origin) return;
        
        // Prefetch the route module
        const path = url.pathname;
        
        // Map paths to lazy loaded components for prefetching
        const routeModules: Record<string, () => Promise<any>> = {
          '/': () => import('@/pages/Index'),
          '/studio': () => import('@/pages/app/Library'),
          '/studio/profile': () => import('@/pages/app/Profile'),
          '/studio/favourites': () => import('@/pages/app/Favourites'),
          '/studio/about': () => import('@/pages/app/About'),
        };
        
        const prefetch = routeModules[path];
        if (prefetch) {
          // Prefetch with low priority using Safari-safe callback
          safeRequestIdleCallback(() => {
            prefetch().catch(() => {
              // Silently fail, will load on navigation
            });
          }, { timeout: 2000 });
        }
      } catch {
        // Silently fail on URL parsing errors
      }
    };
    
    // Add hover listeners
    document.addEventListener('mouseover', prefetchOnHover);
    document.addEventListener('focusin', prefetchOnHover);
    
    return () => {
      document.removeEventListener('mouseover', prefetchOnHover);
      document.removeEventListener('focusin', prefetchOnHover);
    };
  }, []);
};
