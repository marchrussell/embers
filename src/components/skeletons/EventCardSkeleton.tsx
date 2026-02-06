export const EventCardSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 animate-pulse">
      <div className="aspect-video bg-background/10" />
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 bg-background/15 rounded" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-background/10 rounded" />
            <div className="h-4 w-32 bg-background/10 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-background/10 rounded" />
            <div className="h-4 w-24 bg-background/10 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-background/10 rounded" />
            <div className="h-4 w-40 bg-background/10 rounded" />
          </div>
        </div>
        <div className="h-10 w-full bg-background/10 rounded-full mt-4" />
      </div>
    </div>
  );
};
