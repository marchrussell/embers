/**
 * Cloud Storage Image URLs with CDN Optimization
 *
 * This module provides URLs for images stored in Supabase Storage
 * with automatic CDN transformation for responsive, optimized delivery.
 */

// Use VITE_SUPABASE_STORAGE_URL if set (useful for local dev to point storage at production
// while keeping auth/DB local). Falls back to VITE_SUPABASE_URL.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_STORAGE_URL || import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = "site-images";

export interface CloudImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  format?: "origin";
  resize?: "cover" | "contain" | "fill";
}

/**
 * Generate a CDN-optimized URL for a Cloud Storage image
 */
export const getCloudImageUrl = (
  imagePath: string,
  options: CloudImageOptions = {},
  bucket = BUCKET_NAME
): string => {
  const { width, height, quality = 80, resize = "cover" } = options;

  const baseUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${imagePath}`;

  const params = new URLSearchParams();
  if (width) params.append("width", width.toString());
  if (height) params.append("height", height.toString());
  params.append("quality", quality.toString());
  if (width && height) params.append("resize", resize);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate responsive srcset for Cloud Storage images
 */
export const getCloudImageSrcSet = (imagePath: string, options: CloudImageOptions = {}): string => {
  const widths = [320, 640, 768, 1024, 1440, 1920];

  return widths
    .map((width) => {
      const url = getCloudImageUrl(imagePath, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
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
  // Home images
  heroBreathworkWide: "home/breathwork-wide.webp",
  threeWaysMushroom: "home/three-ways-mushroom.webp",
  exploreAudioPlayer: "home/explore-studio-audio-player.webp",
  exploreTestimonials: "home/explore-studio-testimonials.webp",
  nervousSystemReset: "home/nervous-system-reset.webp",

  // Experiences images
  breathPresence: "experiences/breath-presence-heart-connection-in-person.webp",
  breathWorkToDub: "experiences/breathwork-to-dub-in-person.webp",
  monthlyBreath: "experiences/monthly-breath-presence-online.webp",
  moreWaysToPractice: "experiences/more-ways-to-practice.jpg",
  unwindReset: "experiences/unwind-reset.webp",
  weeklyReset: "experiences/weekly-reset.webp",

  // Online images
  startHereButterfly: "online/start-here-butterfly.webp",
  march: "online/march-russell.webp",
  liveSessionCountdownBg: "live/live-session-countdown-bg.webp",

  // About/Bio images
  marchBioPhoto: "about/march-bio-photo.webp",
  marchTeacher: "about/march-russell-teacher.webp",

  // Session images (stored in class-images bucket)
  nsdr: "ai1f75cwoar-1772214259322.webp",
  findingSteadyGround: "c9pe6gazlz-1772213326416.webp",
  immediateRelief: "tb3tn4o4szk-1772458640802.webp",
  // nervousSystemReset: "wku49napxr-1772474484815.webp",
  softeningTension: "9yrw19mqpxn-1772567950813.webp",
  triangleBreathing: "s4gtteeras-1773335509049.webp",
  sleepTransition: "os2kvez50f8-1772472742856.webp",

  // Course images in program-images bucket
  mentalReset: "qnqbmxjlqufzrqxptqsd.webp",
} as const;

// Pre-resolved experience image URLs
export const experienceImages = {
  guestSession: getCloudImageUrl(CLOUD_IMAGES.unwindReset),
  monthlyBreathOnline: getCloudImageUrl(CLOUD_IMAGES.monthlyBreath),
  weeklyReset: getCloudImageUrl(CLOUD_IMAGES.weeklyReset),
  unwindReset: getCloudImageUrl(CLOUD_IMAGES.unwindReset),
  breathPresenceInPerson: getCloudImageUrl(CLOUD_IMAGES.breathPresence),
  breathworkToDub: getCloudImageUrl(CLOUD_IMAGES.breathWorkToDub),
} as const;
