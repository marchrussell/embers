import { Skeleton } from "@/components/ui/skeleton";

interface ModalContentSkeletonProps {
  /** Layout style */
  variant?: "player" | "detail" | "form";
}

export const ModalContentSkeleton = ({ variant = "player" }: ModalContentSkeletonProps) => {
  if (variant === "form") {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48 bg-[#E6DBC7]/15" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 bg-[#E6DBC7]/10" />
              <Skeleton className="h-10 w-full bg-[#E6DBC7]/10" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-full bg-[#E6DBC7]/15" />
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl bg-[#E6DBC7]/10" />
        <Skeleton className="h-8 w-3/4 bg-[#E6DBC7]/15" />
        <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/10" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full bg-[#E6DBC7]/5" />
          <Skeleton className="h-4 w-full bg-[#E6DBC7]/5" />
          <Skeleton className="h-4 w-2/3 bg-[#E6DBC7]/5" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full bg-[#E6DBC7]/15" />
      </div>
    );
  }

  // Player variant (default)
  return (
    <div className="h-full min-h-[400px] flex flex-col">
      {/* Image area */}
      <Skeleton className="h-48 w-full bg-[#E6DBC7]/10" />
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-8 w-3/4 bg-[#E6DBC7]/15" />
        <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/10" />
        
        {/* Audio player skeleton */}
        <div className="pt-8 space-y-4">
          <Skeleton className="h-2 w-full rounded-full bg-[#E6DBC7]/10" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12 bg-[#E6DBC7]/10" />
            <Skeleton className="h-4 w-12 bg-[#E6DBC7]/10" />
          </div>
        </div>
        
        {/* Play button */}
        <div className="flex justify-center pt-4">
          <Skeleton className="w-16 h-16 rounded-full bg-[#E6DBC7]/15" />
        </div>
      </div>
    </div>
  );
};
