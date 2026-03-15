import { NavBar } from "@/components/NavBar";
import { CategoryCardSkeleton } from "./CategoryCardSkeleton";
import { FeaturedHeroSkeleton } from "./FeaturedHeroSkeleton";

export const LibraryEmbeddedSkeleton = () => (
  <div className="px-6 pb-24">
    <div className="mb-20 pt-8">
      <div className="h-8 w-40 bg-muted animate-pulse mb-2 rounded" />
      <div className="h-5 w-80 bg-muted/50 animate-pulse mb-10 rounded" />
      <div className="grid grid-cols-2 gap-6">
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
    <div className="px-6 pt-80 md:pt-96 lg:pt-80 pb-24">
      <div className="container mx-auto max-w-6xl space-y-20">
        <FeaturedHeroSkeleton />
        <div>
          <div className="h-6 w-32 bg-muted animate-pulse mb-8 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
