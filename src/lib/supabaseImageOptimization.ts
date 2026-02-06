/**
 * Supabase Storage Image Optimization
 * Uses Supabase's built-in CDN transformations for optimal performance
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Get optimized image URL from Supabase Storage with CDN transformations
 * This significantly reduces bandwidth and improves load times
 */
export const getOptimizedImageUrl = (
  publicUrl: string,
  options: ImageTransformOptions = {}
): string => {
  // If not a Supabase storage URL, return as-is
  if (!publicUrl || !publicUrl.includes('supabase.co/storage')) {
    return publicUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  // Build transformation parameters
  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('format', format);
  params.append('resize', resize);

  // Add transformation parameters to URL
  const separator = publicUrl.includes('?') ? '&' : '?';
  return `${publicUrl}${separator}${params.toString()}`;
};

/**
 * Generate responsive image srcset for different screen sizes
 * Optimized for mobile-first with smaller sizes
 */
export const generateResponsiveSrcSet = (
  publicUrl: string,
  baseOptions: ImageTransformOptions = {}
): string => {
  if (!publicUrl || !publicUrl.includes('supabase.co/storage')) {
    // For local assets, return empty - Vite will handle optimization
    return '';
  }

  // Mobile-optimized widths: smaller sizes first for better mobile performance
  const widths = [320, 640, 768, 1024, 1440, 1920];
  
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(publicUrl, {
        ...baseOptions,
        width,
      });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Get sizes attribute for responsive images
 * Mobile-optimized: serves smaller images to mobile devices
 */
export const getResponsiveSizes = (breakpoints?: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}): string => {
  const defaults = {
    sm: '100vw',     // Mobile: full viewport width
    md: '100vw',     // Tablets: full viewport width  
    lg: '80vw',      // Small desktop: 80% viewport
    xl: '60vw',      // Large desktop: 60% viewport
  };

  const sizes = { ...defaults, ...breakpoints };

  return `
    (max-width: 640px) ${sizes.sm},
    (max-width: 768px) ${sizes.md},
    (max-width: 1024px) ${sizes.lg},
    ${sizes.xl}
  `.trim();
};

/**
 * Preload critical images for LCP optimization
 */
export const preloadCriticalImage = (
  publicUrl: string,
  options: ImageTransformOptions = {}
) => {
  if (typeof window === 'undefined') return;

  const optimizedUrl = getOptimizedImageUrl(publicUrl, options);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  link.setAttribute('fetchpriority', 'high');
  
  // Add to head
  document.head.appendChild(link);
};

/**
 * Image dimension presets for common use cases
 * Aggressively optimized for mobile performance
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, quality: 60 }, // Mobile-optimized
  card: { width: 400, height: 300, quality: 70 }, // Mobile-optimized
  hero: { width: 1920, height: 1080, quality: 75 }, // Mobile-optimized for LCP
  heroMobile: { width: 640, height: 360, quality: 70 }, // New: Mobile hero variant
  categoryCard: { width: 800, height: 600, quality: 70 }, // Mobile-optimized
  avatar: { width: 200, height: 200, quality: 65 }, // Mobile-optimized
  fullWidth: { width: 1600, quality: 75 }, // Mobile-optimized
} as const;
