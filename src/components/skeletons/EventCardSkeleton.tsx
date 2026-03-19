export const EventCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="aspect-video bg-background/10" />
      <div className="space-y-4 p-6">
        <div className="h-6 w-3/4 rounded bg-background/15" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-background/10" />
            <div className="h-4 w-32 rounded bg-background/10" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-background/10" />
            <div className="h-4 w-24 rounded bg-background/10" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-background/10" />
            <div className="h-4 w-40 rounded bg-background/10" />
          </div>
        </div>
        <div className="mt-4 h-10 w-full rounded-full bg-background/10" />
      </div>
    </div>
  );
};
