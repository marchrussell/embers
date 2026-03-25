import { useCallback, useState } from "react";

import {
  generateResponsiveSrcSet,
  getOptimizedImageUrl,
  getResponsiveSizes,
  ImageTransformOptions,
} from "@/lib/supabaseImageOptimization";
import { cn } from "@/lib/utils";

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
    format: "webp",
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
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: priority ? ("sync" as const) : ("async" as const),
    ...({ fetchpriority: priority ? "high" : "low" } as any),
    onLoad: handleLoad,
    onError: handleError,
    ...props,
  };

  // If error, show fallback
  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/20", className)}>
        <span className="text-sm text-muted-foreground">Failed to load image</span>
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
            className="absolute inset-0 overflow-hidden bg-muted/30"
            style={{ borderRadius: "inherit" }}
          >
            <div
              className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ backgroundSize: "200% 100%" }}
            />
          </div>
        )}
        <img
          {...imgProps}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
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
        ...(showSkeleton && isLoading ? { backgroundColor: "hsl(var(--muted) / 0.3)" } : {}),
      }}
    />
  );
};
