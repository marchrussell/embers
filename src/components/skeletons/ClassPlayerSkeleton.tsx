export const ClassPlayerSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header image */}
      <div className="h-80 bg-background/10" />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-10 w-3/4 bg-background/15 rounded" />
          
          {/* Meta info */}
          <div className="flex gap-6">
            <div className="h-4 w-32 bg-background/10 rounded" />
            <div className="h-4 w-40 bg-background/10 rounded" />
          </div>
          
          {/* Description */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-background/10 rounded" />
            <div className="h-4 w-full bg-background/10 rounded" />
            <div className="h-4 w-2/3 bg-background/10 rounded" />
          </div>
          
          {/* Audio player */}
          <div className="h-24 w-full bg-background/10 rounded-lg mt-8" />
          
          {/* Action buttons */}
          <div className="flex gap-4 pt-6">
            <div className="h-12 w-40 bg-background/10 rounded-full" />
            <div className="h-12 w-40 bg-background/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
