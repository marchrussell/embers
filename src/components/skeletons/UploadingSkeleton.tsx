import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface UploadingSkeletonProps {
  className?: string;
  text?: string;
}

/**
 * A skeleton component for file upload states.
 * Shows a spinner with optional text to indicate upload progress.
 */
export const UploadingSkeleton = ({ 
  className,
  text = "Uploading file..."
}: UploadingSkeletonProps) => (
  <div className={cn(
    "flex items-center gap-2 text-sm text-muted-foreground animate-pulse",
    className
  )}>
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{text}</span>
  </div>
);
