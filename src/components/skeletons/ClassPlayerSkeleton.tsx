export const ClassPlayerSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      {/* Header image */}
      <div className="h-80 bg-background/10" />

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-10 w-3/4 rounded bg-background/15" />

          {/* Meta info */}
          <div className="flex gap-6">
            <div className="h-4 w-32 rounded bg-background/10" />
            <div className="h-4 w-40 rounded bg-background/10" />
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full rounded bg-background/10" />
            <div className="h-4 w-full rounded bg-background/10" />
            <div className="h-4 w-2/3 rounded bg-background/10" />
          </div>

          {/* Audio player */}
          <div className="mt-8 h-24 w-full rounded-lg bg-background/10" />

          {/* Action buttons */}
          <div className="flex gap-4 pt-6">
            <div className="h-12 w-40 rounded-full bg-background/10" />
            <div className="h-12 w-40 rounded-full bg-background/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
