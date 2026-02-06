import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-normal transition-[background-color,border-color,box-shadow,transform] duration-300 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Cream/warm colored buttons (most common in the app)
        default: [
          "border border-[#E6DBC7]/30 text-[#E6DBC7] bg-transparent",
          "hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]",
          "shadow-[0_0_15px_rgba(230,219,199,0.1)]",
          "hover:shadow-[0_0_20px_rgba(230,219,199,0.2)]",
        ],
        // Solid cream button (high emphasis CTA)
        solid: [
          "bg-[#E6DBC7] text-[#1A1A1A] border-transparent",
          "hover:bg-[#E6DBC7]/90",
          "shadow-[0_0_20px_rgba(230,219,199,0.3)]",
          "hover:shadow-[0_0_30px_rgba(230,219,199,0.5)]",
        ],
        // White bordered button
        white: [
          "border border-white/60 text-white bg-transparent",
          "hover:bg-white/10 hover:border-white",
          "shadow-[0_0_15px_rgba(255,255,255,0.15)]",
          "hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]",
        ],
        // Solid white button
        whiteSolid: [
          "bg-white text-black border-transparent",
          "hover:bg-white/90",
          "shadow-[0_0_20px_rgba(255,255,255,0.25)]",
          "hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
        ],
        // Subtle ghost-like button (for secondary actions)
        ghost: [
          "border border-[#E6DBC7]/20 text-[#E6DBC7]/70 bg-transparent",
          "hover:border-[#E6DBC7]/40 hover:text-[#E6DBC7] hover:bg-white/[0.02]",
          "shadow-[0_0_10px_rgba(230,219,199,0.05)]",
          "hover:shadow-[0_0_15px_rgba(230,219,199,0.1)]",
        ],
      },
      size: {
        default: "h-12 px-10 text-[13px] tracking-wide",
        sm: "h-10 px-6 text-[12px] tracking-wide",
        lg: "h-14 px-12 text-[15px] tracking-wide",
        icon: "h-11 w-11 p-0",
        iconLg: "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(glowButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton, glowButtonVariants };
