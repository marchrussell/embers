/**
 * Utility to preload critical images for better perceived performance
 */

const preloadedImages = new Set<string>();

export const preloadImage = (src: string): Promise<void> => {
  // Skip if already preloaded
  if (preloadedImages.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      preloadedImages.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

/**
 * Preload images for the next route based on navigation patterns
 */
export const preloadRouteImages = (route: string) => {
  const routeImageMap: Record<string, string[]> = {
    '/explore': [
      // Add critical explore page images here
    ],
    '/experiences': [
      // Add critical experiences page images here
    ],
    // Add more routes as needed
  };

  const imagesToPreload = routeImageMap[route];
  if (imagesToPreload) {
    preloadImages(imagesToPreload).catch(console.error);
  }
};
