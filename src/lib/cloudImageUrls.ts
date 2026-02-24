/**
 * Cloud Storage Image URLs with CDN Optimization
 * 
 * This module provides URLs for images stored in Supabase Storage
 * with automatic CDN transformation for responsive, optimized delivery.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'site-images';

export interface CloudImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Generate a CDN-optimized URL for a Cloud Storage image
 */
export const getCloudImageUrl = (
  imagePath: string,
  options: CloudImageOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${imagePath}`;
  
  // Build transformation parameters
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('format', format);
  params.append('resize', resize);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate responsive srcset for Cloud Storage images
 */
export const getCloudImageSrcSet = (
  imagePath: string,
  options: CloudImageOptions = {}
): string => {
  const widths = [320, 640, 768, 1024, 1440, 1920];
  
  return widths
    .map(width => {
      const url = getCloudImageUrl(imagePath, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Pre-defined image presets for common use cases
 */
export const CLOUD_IMAGE_PRESETS = {
  heroDesktop: { width: 1920, height: 1080, quality: 85 },
  heroMobile: { width: 640, height: 360, quality: 75 },
  card: { width: 800, height: 600, quality: 75 },
  thumbnail: { width: 400, height: 300, quality: 70 },
  avatar: { width: 200, height: 200, quality: 70 },
  logo: { width: 300, quality: 80 },
} as const;

/**
 * Cloud Storage image paths for key site images
 * These are the images that have been migrated to Cloud Storage
 */
export const CLOUD_IMAGES = {
  // Hero images
  heroBreathworkWide: 'hero/breathwork-wide.webp',
  threeWaysMushroom: 'hero/three-ways-mushroom.webp',
  communityHeroKef: 'hero/community-hero-kef.webp',
  
  // About/Bio images
  marchBioPhoto: 'about/march-bio-photo.webp',
  marchTeacher: 'about/march-russell-teacher.webp',
  
  // Logos
  zoe: 'logos/zoe-logo.webp',
  tesla: 'logos/tesla-logo.webp',
  google: 'logos/google-logo.webp',
  itv: 'logos/itv-logo.webp',
  justeat: 'logos/justeat-logo.webp',
  marchLogo: 'logos/march-logo.webp',
  mLogo: 'logos/m-logo.webp',
} as const;

/**
 * Helper to check if Cloud images are available
 * Falls back to local assets if not uploaded yet
 */
export const useCloudImage = (
  cloudPath: string,
  localFallback: string,
  options: CloudImageOptions = {}
): { src: string; srcSet?: string } => {
  // Always try Cloud first (images should be uploaded)
  const cloudUrl = getCloudImageUrl(cloudPath, options);
  const srcSet = getCloudImageSrcSet(cloudPath, options);
  
  return {
    src: cloudUrl,
    srcSet
  };
};
