export const SessionPlayerSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      {/* Header skeleton */}
      <div className="h-64 bg-background/10" />

      {/* Content area */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-8 w-3/4 rounded bg-background/15" />

          {/* Meta info */}
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-background/10" />
            <div className="h-4 w-32 rounded bg-background/10" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-background/10" />
            <div className="h-4 w-5/6 rounded bg-background/10" />
            <div className="h-4 w-4/6 rounded bg-background/10" />
          </div>

          {/* Audio player */}
          <div className="mt-8 h-20 w-full rounded-lg bg-background/10" />

          {/* Action buttons */}
          <div className="mt-8 flex gap-4">
            <div className="h-12 w-32 rounded-full bg-background/10" />
            <div className="h-12 w-32 rounded-full bg-background/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
