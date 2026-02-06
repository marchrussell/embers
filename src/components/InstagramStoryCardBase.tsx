import { cn } from "@/lib/utils";
import mLogo from "@/assets/m-logo.png";
import marchLogo from "@/assets/march-logo.png";

interface InstagramStoryCardBaseProps {
  backgroundImage: string;
  backgroundPosition?: string;
  children: React.ReactNode;
  overlay?: "blur" | "dark" | "subtle" | "none";
  showBorder?: boolean;
  className?: string;
}

const overlayClasses = {
  blur: "backdrop-blur-lg bg-background/40",
  dark: "bg-black/20",
  subtle: "backdrop-blur-sm bg-black/20",
  none: "",
};

export const InstagramStoryCardBase = ({
  backgroundImage,
  backgroundPosition = "center",
  children,
  overlay = "blur",
  showBorder = true,
  className,
}: InstagramStoryCardBaseProps) => {
  return (
    <div className={cn(
      "relative w-full max-w-md mx-auto aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl",
      className
    )}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition,
        }}
      />

      {/* Overlay */}
      {overlay !== "none" && (
        <div className={cn("absolute inset-0", overlayClasses[overlay])} />
      )}

      {/* Bottom Gradient for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      {/* Content */}
      {children}

      {/* Decorative glass border */}
      {showBorder && (
        <div className="absolute top-6 left-6 right-6 bottom-6 rounded-2xl border border-foreground/10 pointer-events-none" />
      )}
    </div>
  );
};

// Shared brand logo component for Instagram cards
interface BrandLogosProps {
  showMarchLogo?: boolean;
  logoSize?: "sm" | "md" | "lg";
  colorFilter?: string;
}

const logoSizes = {
  sm: { m: "w-16 h-16", march: "w-28" },
  md: { m: "w-24 h-24", march: "w-40" },
  lg: { m: "w-32 h-32", march: "w-48" },
};

const defaultColorFilter = "brightness(0) saturate(100%) invert(40%) sepia(78%) saturate(1566%) hue-rotate(340deg) brightness(92%) contrast(90%)";
const glowColorFilter = "brightness(0) saturate(100%) invert(71%) sepia(44%) saturate(1245%) hue-rotate(337deg) brightness(97%) contrast(92%) drop-shadow(0 0 20px hsl(30, 80%, 57%, 0.9)) drop-shadow(0 0 40px hsl(30, 80%, 57%, 0.7))";

export const InstagramBrandLogos = ({
  showMarchLogo = true,
  logoSize = "md",
  colorFilter = defaultColorFilter,
}: BrandLogosProps) => {
  const sizes = logoSizes[logoSize];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* M Logo */}
      <div className={cn(sizes.m, "flex items-center justify-center")}>
        <img
          src={mLogo}
          alt="M Logo"
          className="w-full h-full object-contain drop-shadow-2xl"
          style={{ filter: colorFilter }}
        />
      </div>

      {/* March Logo */}
      {showMarchLogo && (
        <div className={cn(sizes.march, "flex items-center justify-center")}>
          <img
            src={marchLogo}
            alt="March Logo"
            className="w-full h-auto object-contain drop-shadow-2xl"
            style={{ filter: colorFilter }}
          />
        </div>
      )}
    </div>
  );
};

// Text styling for Instagram cards
interface InstagramTextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body" | "signature";
  className?: string;
}

const textStyles = {
  title: {
    className: "text-sm font-semibold uppercase tracking-[0.2em]",
    style: {
      color: "#E6DBC7",
      textShadow: "0 2px 12px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.15)",
    },
  },
  subtitle: {
    className: "text-sm font-semibold uppercase tracking-[0.2em]",
    style: {
      color: "#E6DBC7",
      textShadow: "0 2px 12px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.15)",
    },
  },
  body: {
    className: "text-sm leading-relaxed",
    style: {
      color: "#E6DBC7",
      textShadow: "0 2px 8px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 255, 255, 0.1)",
      lineHeight: "1.6",
    },
  },
  signature: {
    className: "text-sm font-light",
    style: {
      color: "#E6DBC7",
      textShadow: "0 2px 8px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 255, 255, 0.1)",
    },
  },
};

export const InstagramText = ({ children, variant = "body", className }: InstagramTextProps) => {
  const styles = textStyles[variant];
  return (
    <p className={cn(styles.className, className)} style={styles.style}>
      {children}
    </p>
  );
};

// Export constants for reuse
export const INSTAGRAM_FILTERS = {
  default: defaultColorFilter,
  glow: glowColorFilter,
  glowStrong: `${glowColorFilter} drop-shadow(0 0 60px hsl(30, 80%, 57%, 0.5))`,
};
