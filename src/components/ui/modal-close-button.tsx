import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalCloseButtonProps {
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  position?: "default" | "tight" | "loose";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 md:w-6 md:h-6",
  md: "w-6 h-6 md:w-7 md:h-7",
  lg: "w-7 h-7 md:w-8 md:h-8",
};

const positionClasses = {
  default: "top-5 right-5 md:top-6 md:right-6",
  tight: "top-4 right-4 md:top-5 md:right-5",
  loose: "top-6 right-6 sm:top-8 sm:right-8",
};

export const ModalCloseButton = ({
  onClose,
  size = "md",
  position = "default",
  className,
}: ModalCloseButtonProps) => {
  return (
    <button
      onClick={onClose}
      className={cn(
        "absolute z-50 opacity-70 hover:opacity-100 transition-opacity",
        positionClasses[position],
        className
      )}
      aria-label="Close"
    >
      <X className={cn(sizeClasses[size], "text-white")} />
    </button>
  );
};
