import * as React from "react";
import { cn } from "@/lib/utils";

export interface DarkTextareaProps extends React.ComponentProps<"textarea"> {
  variant?: "default" | "filled" | "ghost";
}

const variantClasses = {
  default: "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40",
  filled: "bg-white border-white/15 text-black placeholder:text-black/40 focus:border-white/30",
  ghost: "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40",
};

const DarkTextarea = React.forwardRef<HTMLTextAreaElement, DarkTextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border px-5 py-4 text-base ring-offset-background transition-colors resize-none",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
DarkTextarea.displayName = "DarkTextarea";

export { DarkTextarea };
