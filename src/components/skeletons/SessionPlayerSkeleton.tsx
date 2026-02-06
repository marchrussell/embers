export const SessionPlayerSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="h-64 bg-background/10" />
      
      {/* Content area */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-8 w-3/4 bg-background/15 rounded" />
          
          {/* Meta info */}
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-background/10 rounded" />
            <div className="h-4 w-32 bg-background/10 rounded" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-background/10 rounded" />
            <div className="h-4 w-5/6 bg-background/10 rounded" />
            <div className="h-4 w-4/6 bg-background/10 rounded" />
          </div>
          
          {/* Audio player */}
          <div className="h-20 w-full bg-background/10 rounded-lg mt-8" />
          
          {/* Action buttons */}
          <div className="flex gap-4 mt-8">
            <div className="h-12 w-32 bg-background/10 rounded-full" />
            <div className="h-12 w-32 bg-background/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
