import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, generateResponsiveSrcSet, getResponsiveSizes, ImageTransformOptions } from "@/lib/supabaseImageOptimization";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  optimizationOptions?: ImageTransformOptions;
  responsive?: boolean;
  showSkeleton?: boolean;
  /** 
   * When true, wraps image in a container for skeleton overlay.
   * When false (default), renders a plain img tag with original sizing behavior.
   */
  wrapForSkeleton?: boolean;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  priority = false,
  optimizationOptions = {},
  responsive = true,
  showSkeleton = true,
  wrapForSkeleton = false,
  ...props 
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get optimized image URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    quality: 80,
    format: 'webp',
    ...optimizationOptions,
  });

  // Generate responsive srcset if enabled
  const srcSet = responsive ? generateResponsiveSrcSet(src, optimizationOptions) : undefined;
  const sizes = responsive ? getResponsiveSizes() : undefined;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  // Common image props
  const imgProps = {
    src: optimizedSrc,
    srcSet,
    sizes,
    alt,
    loading: priority ? "eager" as const : "lazy" as const,
    decoding: priority ? "sync" as const : "async" as const,
    ...{ fetchpriority: priority ? "high" : "low" } as any,
    onLoad: handleLoad,
    onError: handleError,
    ...props,
  };

  // If error, show fallback
  if (error) {
    return (
      <div className={cn("bg-muted/20 flex items-center justify-center", className)}>
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  // For wrapped skeleton mode (when container control is needed)
  if (wrapForSkeleton && showSkeleton) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Skeleton placeholder */}
        {isLoading && (
          <div 
            className="absolute inset-0 bg-muted/30 overflow-hidden"
            style={{ borderRadius: 'inherit' }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        )}
        <img
          {...imgProps}
          className={cn(
            "transition-opacity duration-300 w-full h-full object-cover",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>
    );
  }

  // Default: plain optimized img tag preserving original sizing behavior
  return (
    <img
      {...imgProps}
      className={cn(
        "transition-opacity duration-300",
        showSkeleton && isLoading ? "opacity-0" : "opacity-100",
        className
      )}
      style={{
        ...props.style,
        // Subtle background while loading
        ...(showSkeleton && isLoading ? { backgroundColor: 'hsl(var(--muted) / 0.3)' } : {}),
      }}
    />
  );
};
