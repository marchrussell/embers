import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default cream-themed icon button
        default: [
          "border border-[#E6DBC7]/25 text-[#E6DBC7]/60",
          "hover:text-[#E6DBC7] hover:border-[#E6DBC7]/50",
          "shadow-[0_0_10px_rgba(230,219,199,0.08)]",
          "hover:shadow-[0_0_15px_rgba(230,219,199,0.15)]",
        ],
        // White-themed icon button
        white: [
          "border border-white/20 text-white/60 bg-white/10 backdrop-blur-md",
          "hover:text-white hover:bg-white/20",
          "shadow-[0_0_15px_rgba(255,255,255,0.1)]",
          "hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
        ],
        // Ghost (minimal styling)
        ghost: [
          "border border-transparent text-[#E6DBC7]/50",
          "hover:text-[#E6DBC7] hover:bg-[#E6DBC7]/5",
        ],
      },
      size: {
        default: "w-11 h-11 [&_svg]:w-5 [&_svg]:h-5",
        sm: "w-10 h-10 [&_svg]:w-4 [&_svg]:h-4",
        lg: "w-12 h-12 [&_svg]:w-5 [&_svg]:h-5",
        xl: "w-14 h-14 [&_svg]:w-6 [&_svg]:h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
