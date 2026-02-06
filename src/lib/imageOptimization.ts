// Image optimization utilities

/**
 * Get optimized image props for different screen sizes
 */
export const getResponsiveImageProps = (baseUrl: string) => {
  return {
    src: baseUrl,
    srcSet: `${baseUrl}?w=400 400w, ${baseUrl}?w=800 800w, ${baseUrl}?w=1200 1200w`,
    sizes: "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px",
  };
};

/**
 * Preload critical images for LCP optimization
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
};

/**
 * Lazy load images when they enter viewport
 */
export const setupIntersectionObserver = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px', // Start loading 50px before entering viewport
    });

    return imageObserver;
  }
  return null;
};
