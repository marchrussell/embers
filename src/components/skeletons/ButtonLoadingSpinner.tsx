import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonLoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * A spinner component designed for use inside buttons during loading states.
 * Provides consistent loading feedback across the application.
 */
export const ButtonLoadingSpinner = ({ 
  className, 
  size = "md" 
}: ButtonLoadingSpinnerProps) => (
  <Loader2 
    className={cn(
      "animate-spin",
      sizeClasses[size],
      className
    )} 
  />
);
