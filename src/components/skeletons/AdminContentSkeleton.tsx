import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminContentSkeletonProps {
  /** Show stat cards at the top */
  showStats?: boolean;
  /** Number of stat cards to show */
  statsCount?: number;
  /** Layout variant */
  variant?: "cards" | "table" | "list";
}

export const AdminContentSkeleton = ({
  showStats = true,
  statsCount = 4,
  variant = "cards",
}: AdminContentSkeletonProps) => {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <Card key={i} className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg bg-[#E6DBC7]/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16 bg-[#E6DBC7]/10" />
                    <Skeleton className="h-6 w-12 bg-[#E6DBC7]/15" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content area */}
      {variant === "cards" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-40 w-full rounded-lg bg-[#E6DBC7]/5" />
                <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/15" />
                <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variant === "table" && (
        <Card className="overflow-hidden border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
          <div className="border-b border-[#E6DBC7]/10 p-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 flex-1 bg-[#E6DBC7]/10" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#E6DBC7]/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 flex-1 bg-[#E6DBC7]/5" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {variant === "list" && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-lg bg-[#E6DBC7]/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 bg-[#E6DBC7]/15" />
                  <Skeleton className="h-4 w-3/4 bg-[#E6DBC7]/10" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg bg-[#E6DBC7]/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
