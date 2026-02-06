// Dynamic image loader to avoid loading all images at app start
export const loadImage = (imageName: string) => {
  const images: Record<string, () => Promise<{ default: string }>> = {
    // Landing page images
    'march-logo': () => import('@/assets/march-logo.png'),
    'march-russell-teacher': () => import('@/assets/march-russell-teacher.jpg'),
    'm-logo': () => import('@/assets/m-logo.png'),
    'trial-program': () => import('@/assets/trial-program.webp'),
    'hero-background': () => import('@/assets/hero-background.jpg'),
    'mushroom-closeup': () => import('@/assets/mushroom-closeup.jpg'),
    'get-in-touch-breath': () => import('@/assets/get-in-touch-breath.jpg'),
    'new-divider': () => import('@/assets/new-divider.jpg'),
    'testimonials-divider': () => import('@/assets/testimonials-divider.png'),
    'vintage-texture': () => import('@/assets/vintage-texture.png'),
    'cross-pattern-final': () => import('@/assets/cross-pattern-final.png'),
    'circle-ring-final': () => import('@/assets/circle-ring-final.png'),
    'wood-texture': () => import('@/assets/wood-texture.jpg'),
    'breath36': () => import('@/assets/breath36.jpg'),
    'community-image': () => import('@/assets/community-image.jpg'),
    'community-hero-kef': () => import('@/assets/community-hero-kef.jpg'),
    'march-bio-photo': () => import('@/assets/march-bio-photo.jpg'),
    
    // Library images
    'humming-reset': () => import('@/assets/humming-reset.jpg'),
    'breathing-basics': () => import('@/assets/breathing-basics.jpg'),
    'energy-category-new': () => import('@/assets/energy-category-new.jpg'),
    'finding-aliveness': () => import('@/assets/finding-aliveness.jpg'),
    'mentorship-coach': () => import('@/assets/mentorship-coach.jpg'),
    'mentorship-background': () => import('@/assets/mentorship-background.jpg'),
    'mentorship-orange-bg': () => import('@/assets/mentorship-orange-bg.jpg'),
    'sand-dunes-bg': () => import('@/assets/sand-dunes-bg.jpg'),
    'sleep-category-new': () => import('@/assets/sleep-category-new.jpg'),
    'awaken-category-updated': () => import('@/assets/awaken-category-updated.jpg'),
    'reset-category-new': () => import('@/assets/reset-category-new.jpg'),
    'heal-category-birds-flowers': () => import('@/assets/heal-category-birds-flowers.jpg'),
    'meditations-category': () => import('@/assets/meditations-category.jpg'),
    
    // Logo images
    'zoe-logo': () => import('@/assets/logos/zoe-logo.png'),
    'tesla-logo': () => import('@/assets/logos/tesla-logo.png'),
    'google-logo': () => import('@/assets/logos/google-logo.png'),
    'itv-logo': () => import('@/assets/logos/itv-logo.png'),
    'justeat-logo': () => import('@/assets/logos/justeat-logo.png'),
  };

  return images[imageName]?.();
};

// Preload critical images for instant display
export const preloadCriticalImages = () => {
  // Only preload hero images that are immediately visible
  const criticalImages = [
    'mushroom-closeup',
    'march-russell-teacher',
  ];

  criticalImages.forEach(img => {
    loadImage(img);
  });
};
