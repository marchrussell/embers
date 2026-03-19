export const PageSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-border/10 bg-muted/20 md:h-20" />

      {/* Hero section skeleton */}
      <div className="relative h-[60vh] bg-muted/10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/5 to-background" />
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto space-y-8 px-4 py-12">
        <div className="mx-auto h-8 w-1/3 rounded bg-muted/20" />
        <div className="mx-auto h-4 w-2/3 rounded bg-muted/10" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-lg bg-muted/10" />
          ))}
        </div>
      </div>
    </div>
  );
};
