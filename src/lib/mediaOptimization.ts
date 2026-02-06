/**
 * Media Optimization Utilities
 * Handles video and audio file optimization
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get optimized video URL with streaming support
 */
export const getOptimizedVideoUrl = (publicUrl: string): string => {
  // For Supabase storage URLs, ensure proper content-type headers
  if (publicUrl && publicUrl.includes('supabase.co/storage')) {
    // Add download parameter to ensure proper streaming headers
    const separator = publicUrl.includes('?') ? '&' : '?';
    return `${publicUrl}${separator}download=true`;
  }
  return publicUrl;
};

/**
 * Preload video metadata for faster playback
 */
export const preloadVideoMetadata = (videoUrl: string) => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = videoUrl;
  document.head.appendChild(link);
};

/**
 * Generate video poster/thumbnail from first frame
 * This improves perceived performance by showing something immediately
 */
export const generateVideoPoster = async (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 0;
    });

    video.addEventListener('seeked', () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate poster'));
          }
        }, 'image/jpeg', 0.8);
      }
    });

    video.addEventListener('error', reject);
    video.src = URL.createObjectURL(videoFile);
  });
};

/**
 * Check if browser supports modern video formats
 */
export const getVideoFormatSupport = () => {
  const video = document.createElement('video');
  return {
    webm: video.canPlayType('video/webm') !== '',
    mp4: video.canPlayType('video/mp4') !== '',
    hls: video.canPlayType('application/vnd.apple.mpegurl') !== '',
  };
};

/**
 * Lazy load audio file
 */
export const lazyLoadAudio = (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', () => resolve());
    audio.addEventListener('error', reject);
    audio.src = audioUrl;
  });
};

/**
 * Upload media file with progress tracking
 */
export const uploadMediaFile = async (
  file: File,
  bucket: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Note: Supabase client doesn't support progress tracking directly
  // For progress tracking, implement chunked upload or use FormData with XHR
  if (onProgress) {
    onProgress(0);
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  if (onProgress) {
    onProgress(100);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Compress image before upload
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 2000,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          quality
        );
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
