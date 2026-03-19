import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  /** Whether this is the March AI dashboard */
  variant?: "default" | "march";
}

export const DashboardSkeleton = ({ variant = "default" }: DashboardSkeletonProps) => {
  if (variant === "march") {
    return (
      <div className="min-h-screen bg-black">
        {/* Header area */}
        <div className="px-6 pb-8 pt-24">
          <Skeleton className="mb-4 h-10 w-48 bg-[#E6DBC7]/10" />
          <Skeleton className="h-5 w-80 bg-[#E6DBC7]/5" />
        </div>

        {/* Main content */}
        <div className="space-y-8 px-6">
          {/* Chat/recommendation area */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full bg-[#E6DBC7]/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-[#E6DBC7]/10" />
                  <Skeleton className="h-4 w-3/4 bg-[#E6DBC7]/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Session cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3 rounded-xl border border-[#E6DBC7]/10 p-4">
                <Skeleton className="h-32 w-full rounded-lg bg-[#E6DBC7]/5" />
                <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/10" />
                <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard skeleton
  return (
    <div className="min-h-screen bg-black">
      {/* Hero section */}
      <div className="relative h-[40vh]">
        <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Skeleton className="mb-4 h-12 w-64 bg-[#E6DBC7]/15" />
          <Skeleton className="h-5 w-96 max-w-full bg-[#E6DBC7]/10" />
        </div>
      </div>

      {/* Content grid */}
      <div className="space-y-8 px-6 py-8 md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl bg-[#E6DBC7]/5" />
              <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/10" />
              <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
