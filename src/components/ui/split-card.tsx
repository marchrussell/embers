import { memo } from "react";

import { cn } from "@/lib/utils";

export const STACKED_IMAGE_OVERLAY = (
  <>
    <div
      className="absolute inset-0 hidden lg:block"
      style={{
        background:
          "linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)",
      }}
    />
    <div
      className="absolute inset-0 lg:hidden"
      style={{
        background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)",
      }}
    />
  </>
);

// Full class strings required for Tailwind static analysis — no dynamic construction
const BP = {
  md: {
    flexRow: "md:flex-row",
    imgVisible: "hidden md:block",
    imgAutoH: "md:h-auto md:min-h-full",
    contentLayout:
      "md:relative md:flex-1 md:justify-center md:backdrop-blur-2xl md:bg-black/10",
  },
  lg: {
    flexRow: "lg:flex-row",
    imgVisible: "hidden lg:block",
    imgAutoH: "lg:h-auto lg:min-h-full",
    contentLayout: "lg:relative lg:flex-1 lg:justify-center lg:bg-transparent",
  },
} as const;

const DEFAULT_LEFT_PANEL: Record<"md" | "lg", string> = {
  md: "md:w-1/2",
  lg: "lg:w-[52%]",
};

interface SplitCardProps {
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: string;
  imageWidth?: number;
  breakpoint?: "md" | "lg";
  height?: string;
  minHeight?: string;
  mobileLayout?: "overlay" | "stacked";
  className?: string;
  contentClassName?: string;
  leftPanelClassName?: string;
  imageOverlay?: React.ReactNode | null;
  // stacked mode defaults to the dark right-fade gradient; pass null to disable
  containerBackground?: string | null;
  badgeSlot?: React.ReactNode;
  as?: React.ElementType;
  children: React.ReactNode;
  [key: string]: unknown;
}

const SplitCard = memo(
  ({
    imageSrc,
    imageAlt,
    imageObjectPosition = "center",
    imageWidth = 45,
    breakpoint = "md",
    height,
    minHeight,
    mobileLayout = "overlay",
    className,
    contentClassName,
    leftPanelClassName,
    imageOverlay,
    containerBackground,
    badgeSlot,
    as: Comp = "div",
    children,
    ...rest
  }: SplitCardProps) => {
    const bp = BP[breakpoint];
    const isOverlay = mobileLayout === "overlay";

    const resolvedMinHeight = minHeight ?? (isOverlay ? undefined : "min-h-[400px]");
    const resolvedLeftPanel =
      leftPanelClassName ?? (isOverlay ? undefined : DEFAULT_LEFT_PANEL[breakpoint]);
    const resolvedImageOverlay =
      imageOverlay === null ? null : imageOverlay ?? (isOverlay ? null : STACKED_IMAGE_OVERLAY);
    const resolvedBackground =
      containerBackground === null
        ? undefined
        : containerBackground ??
          (isOverlay ? undefined : "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)");

    return (
      <Comp
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.12]",
          "cursor-pointer shadow-glow-strong transition-colors duration-500 hover:border-white/25",
          height,
          resolvedMinHeight,
          className,
        )}
        style={resolvedBackground ? { background: resolvedBackground } : undefined}
        {...rest}
      >
        {/* Background image — overlay mode only (mobile full-bleed). Stacked mode uses the
            left panel image + container CSS gradient instead; no background img needed. */}
        {isOverlay && (
          <>
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: imageObjectPosition }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-background/40 md:via-transparent md:to-transparent" />
          </>
        )}

        {badgeSlot}

        {/* Inner flex wrapper */}
        <div
          className={cn(
            "flex flex-col",
            bp.flexRow,
            isOverlay ? "absolute inset-0" : "relative flex-1",
          )}
        >
          {/* Left image panel */}
          <div
            className={cn(
              "relative shrink-0 overflow-hidden",
              isOverlay ? bp.imgVisible : cn("h-[240px]", bp.imgAutoH),
              resolvedLeftPanel,
            )}
            style={isOverlay ? { width: `${imageWidth}%` } : undefined}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              style={{ objectPosition: imageObjectPosition }}
              loading="lazy"
            />
            {resolvedImageOverlay}
          </div>

          {/* Right content panel */}
          <div
            className={cn(
              "flex flex-col",
              isOverlay
                ? cn("absolute bottom-0 left-0 right-0", bp.contentLayout)
                : cn("flex-1 justify-center bg-black/95", bp.contentLayout),
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </Comp>
    );
  },
);

SplitCard.displayName = "SplitCard";
export default SplitCard;
