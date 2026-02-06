import { cn } from "@/lib/utils";

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | string;
}

/**
 * Skeleton placeholder for images while they're loading.
 * Shows a smooth shimmer animation with proper aspect ratio.
 */
export const ImageSkeleton = ({ 
  className, 
  aspectRatio = "video" 
}: ImageSkeletonProps) => {
  const aspectRatioStyles: Record<string, string> = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };

  const aspectClass = aspectRatioStyles[aspectRatio] || aspectRatio;

  return (
    <div 
      className={cn(
        "relative bg-muted/40 rounded-lg overflow-hidden",
        aspectClass,
        className
      )}
    >
      {/* Smooth shimmer effect overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer"
      />
    </div>
  );
};
