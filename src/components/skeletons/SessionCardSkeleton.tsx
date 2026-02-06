export const SessionCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-background/5 animate-pulse">
      <div className="aspect-video bg-background/10" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-background/10 rounded" />
        <div className="h-5 w-3/4 bg-background/15 rounded" />
        <div className="flex items-center gap-4 pt-2">
          <div className="h-3 w-20 bg-background/10 rounded" />
          <div className="h-3 w-24 bg-background/10 rounded" />
        </div>
      </div>
    </div>
  );
};
