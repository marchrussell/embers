export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 md:h-20 bg-muted/20 border-b border-border/10" />
      
      {/* Hero section skeleton */}
      <div className="relative h-[60vh] bg-muted/10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/5 to-background" />
      </div>
      
      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="h-8 bg-muted/20 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-muted/10 rounded w-2/3 mx-auto" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
