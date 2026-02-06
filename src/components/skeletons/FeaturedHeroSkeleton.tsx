export const FeaturedHeroSkeleton = () => {
  return (
    <section className="relative h-[600px] overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      <div className="relative h-full container mx-auto px-4 flex items-end pb-16">
        <div className="max-w-2xl space-y-4">
          <div className="h-4 w-32 bg-white/[0.05] rounded" />
          <div className="h-12 w-96 bg-white/[0.05] rounded" />
          <div className="h-6 w-64 bg-white/[0.04] rounded" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 bg-white/[0.05] rounded-full" />
            <div className="h-12 w-12 bg-white/[0.05] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
