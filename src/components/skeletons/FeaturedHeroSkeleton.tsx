export const FeaturedHeroSkeleton = () => {
  return (
    <section className="relative h-[600px] animate-pulse overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      <div className="container relative mx-auto flex h-full items-end px-4 pb-16">
        <div className="max-w-2xl space-y-4">
          <div className="h-4 w-32 rounded bg-white/[0.05]" />
          <div className="h-12 w-96 rounded bg-white/[0.05]" />
          <div className="h-6 w-64 rounded bg-white/[0.04]" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 rounded-full bg-white/[0.05]" />
            <div className="h-12 w-12 rounded-full bg-white/[0.05]" />
          </div>
        </div>
      </div>
    </section>
  );
};
