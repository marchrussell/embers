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
      <div className="hidden lg:flex flex-row gap-6 xl:gap-8 items-stretch justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[320px] xl:w-[340px]">
            <div className="relative overflow-hidden rounded-2xl w-full h-[420px] xl:h-[460px] border border-white/10 bg-white/5">
              <Skeleton className="absolute inset-0 w-full h-full bg-white/10" />
              {/* Play button skeleton */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-20 h-20 rounded-full bg-white/10" />
              </div>
              {/* Content skeleton */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <Skeleton className="h-3 w-20 bg-white/20" />
                <Skeleton className="h-6 w-40 bg-white/15" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tablet: 2 columns grid centered */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-5 max-w-[620px] mx-auto">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="relative overflow-hidden rounded-2xl w-full h-[380px] border border-white/10 bg-white/5">
              <Skeleton className="absolute inset-0 w-full h-full bg-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-[72px] h-[72px] rounded-full bg-white/10" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
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
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] snap-start">
              <div className="relative overflow-hidden rounded-2xl w-full h-[340px] border border-white/10 bg-white/5">
                <Skeleton className="absolute inset-0 w-full h-full bg-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="w-16 h-16 rounded-full bg-white/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
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
