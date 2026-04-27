import { NavBar } from "@/components/NavBar";

import { CategoryCardSkeleton } from "./CategoryCardSkeleton";
import { FeaturedHeroSkeleton } from "./FeaturedHeroSkeleton";

export const LibraryEmbeddedSkeleton = () => (
  <div className="pb-24">
    <div className="mb-20 pt-8 md:pt-[150px]">
      <div className="mb-2 h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="mb-10 h-5 w-80 animate-pulse rounded bg-muted/50" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const LibraryPageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <NavBar />
    <div className="px-6 pb-24 pt-80 md:pt-96 lg:pt-80">
      <div className="container mx-auto max-w-6xl space-y-20">
        <FeaturedHeroSkeleton />
        <div>
          <div className="mb-8 h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
