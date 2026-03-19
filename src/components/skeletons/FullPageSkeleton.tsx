import { Skeleton } from "@/components/ui/skeleton";

interface FullPageSkeletonProps {
  /** Show a simplified dark variant for auth-protected pages */
  variant?: "default" | "minimal" | "studio";
}

export const FullPageSkeleton = ({ variant = "default" }: FullPageSkeletonProps) => {
  if (variant === "minimal") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-6 px-6">
          <Skeleton className="mx-auto h-16 w-16 rounded-full bg-[#E6DBC7]/10" />
          <Skeleton className="mx-auto h-8 w-3/4 bg-[#E6DBC7]/10" />
          <Skeleton className="mx-auto h-4 w-1/2 bg-[#E6DBC7]/5" />
        </div>
      </div>
    );
  }

  if (variant === "studio") {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar placeholder */}
        <div className="h-16 border-b border-[#E6DBC7]/10 md:h-20" />

        {/* Hero area */}
        <div className="relative h-[40vh]">
          <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Content */}
        <div className="space-y-8 px-6 py-8 md:px-10 lg:px-12">
          <Skeleton className="h-8 w-48 bg-[#E6DBC7]/10" />
          <Skeleton className="h-5 w-80 bg-[#E6DBC7]/5" />

          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
  }

  // Default variant
  return (
    <div className="min-h-screen bg-background" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* Hero/header area skeleton */}
      <div className="relative h-[30vh]">
        <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto space-y-6 px-6 py-8">
        <Skeleton className="h-10 w-64 bg-[#E6DBC7]/10" />
        <Skeleton className="h-5 w-96 bg-[#E6DBC7]/5" />

        <div className="space-y-4 pt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg bg-[#E6DBC7]/5" />
          ))}
        </div>
      </div>
    </div>
  );
};
