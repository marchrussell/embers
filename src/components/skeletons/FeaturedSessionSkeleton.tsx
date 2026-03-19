import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedSessionSkeletonProps {
  count?: number;
}

/**
 * Skeleton for featured session cards on the home page
 */
export const FeaturedSessionSkeleton = ({ count = 3 }: FeaturedSessionSkeletonProps) => {
  return (
    <>
      {/* Desktop: 3 cards centered */}
      <div className="hidden flex-row items-stretch justify-center gap-6 lg:flex xl:gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[320px] xl:w-[340px]">
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 xl:h-[460px]">
              <Skeleton className="absolute inset-0 h-full w-full bg-white/10" />
              {/* Play button skeleton */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-20 w-20 rounded-full bg-white/10" />
              </div>
              {/* Content skeleton */}
              <div className="absolute bottom-0 left-0 right-0 space-y-3 p-6">
                <Skeleton className="h-3 w-20 bg-white/20" />
                <Skeleton className="h-6 w-40 bg-white/15" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet: 2 columns grid centered */}
      <div className="mx-auto hidden max-w-[620px] grid-cols-2 gap-5 md:grid lg:hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Skeleton className="absolute inset-0 h-full w-full bg-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-[72px] w-[72px] rounded-full bg-white/10" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 space-y-2 p-5">
                <Skeleton className="h-3 w-16 bg-white/20" />
                <Skeleton className="h-5 w-32 bg-white/15" />
                <Skeleton className="h-3 w-14 bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Carousel skeleton */}
      <div className="md:hidden">
        <div
          className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[280px] flex-shrink-0 snap-start">
              <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Skeleton className="absolute inset-0 h-full w-full bg-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
                  <Skeleton className="h-3 w-16 bg-white/20" />
                  <Skeleton className="h-5 w-28 bg-white/15" />
                  <Skeleton className="h-3 w-12 bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
