import { cn } from "@/lib/utils";

// Base skeleton box component
interface SkeletonBoxProps {
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
}

const aspectRatioClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  auto: "",
};

export const SkeletonBox = ({ className, aspectRatio = "auto" }: SkeletonBoxProps) => (
  <div
    className={cn(
      "bg-background/10 rounded animate-pulse",
      aspectRatioClasses[aspectRatio],
      className
    )}
  />
);

// Skeleton line for text placeholders
interface SkeletonLineProps {
  width?: "full" | "3/4" | "2/3" | "1/2" | "1/3" | "1/4";
  height?: "3" | "4" | "5" | "6" | "8";
  variant?: "default" | "title" | "subtitle";
  className?: string;
}

const widthClasses = {
  full: "w-full",
  "3/4": "w-3/4",
  "2/3": "w-2/3",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
  "1/4": "w-1/4",
};

const heightClasses = {
  "3": "h-3",
  "4": "h-4",
  "5": "h-5",
  "6": "h-6",
  "8": "h-8",
};

const variantClasses = {
  default: "bg-background/10",
  title: "bg-background/15",
  subtitle: "bg-background/10",
};

export const SkeletonLine = ({
  width = "full",
  height = "4",
  variant = "default",
  className,
}: SkeletonLineProps) => (
  <div
    className={cn(
      "rounded animate-pulse",
      widthClasses[width],
      heightClasses[height],
      variantClasses[variant],
      className
    )}
  />
);

// Skeleton circle for avatars/icons
interface SkeletonCircleProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const circleSizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export const SkeletonCircle = ({ size = "md", className }: SkeletonCircleProps) => (
  <div
    className={cn(
      "rounded-full bg-background/10 animate-pulse",
      circleSizeClasses[size],
      className
    )}
  />
);

// Skeleton button placeholder
interface SkeletonButtonProps {
  variant?: "default" | "full";
  className?: string;
}

export const SkeletonButton = ({ variant = "default", className }: SkeletonButtonProps) => (
  <div
    className={cn(
      "h-10 bg-background/10 rounded-full animate-pulse",
      variant === "full" ? "w-full" : "w-32",
      className
    )}
  />
);

// Skeleton icon placeholder
interface SkeletonIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const SkeletonIcon = ({ size = "md", className }: SkeletonIconProps) => (
  <div
    className={cn(
      "rounded bg-background/10 animate-pulse",
      iconSizeClasses[size],
      className
    )}
  />
);

// Composable card skeleton
interface CardSkeletonProps {
  variant?: "vertical" | "horizontal";
  showThumbnail?: boolean;
  thumbnailAspect?: "video" | "square";
  lines?: number;
  showMeta?: boolean;
  showButton?: boolean;
  className?: string;
}

export const CardSkeleton = ({
  variant = "vertical",
  showThumbnail = true,
  thumbnailAspect = "video",
  lines = 2,
  showMeta = true,
  showButton = false,
  className,
}: CardSkeletonProps) => {
  if (variant === "horizontal") {
    return (
      <div className={cn("flex items-center gap-4 p-4 bg-background/5 rounded-lg animate-pulse", className)}>
        {showThumbnail && (
          <div className="w-20 h-20 bg-background/10 rounded flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <SkeletonLine width="3/4" height="5" variant="title" />
          {showMeta && <SkeletonLine width="1/2" height="3" />}
        </div>
        <SkeletonCircle size="md" />
      </div>
    );
  }

  return (
    <div className={cn("group relative overflow-hidden rounded-lg bg-background/5 animate-pulse", className)}>
      {showThumbnail && <SkeletonBox aspectRatio={thumbnailAspect} />}
      <div className="p-5 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === 0 ? "1/4" : "3/4"}
            height={i === 0 ? "3" : "5"}
            variant={i === 0 ? "default" : "title"}
          />
        ))}
        {showMeta && (
          <div className="flex items-center gap-4 pt-2">
            <SkeletonLine width="1/4" height="3" />
            <SkeletonLine width="1/3" height="3" />
          </div>
        )}
        {showButton && <SkeletonButton variant="full" className="mt-4" />}
      </div>
    </div>
  );
};
