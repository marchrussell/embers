export const SessionCardSkeleton = () => {
  return (
    <div className="group relative animate-pulse overflow-hidden rounded-lg bg-background/5">
      <div className="aspect-video bg-background/10" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-16 rounded bg-background/10" />
        <div className="h-5 w-3/4 rounded bg-background/15" />
        <div className="flex items-center gap-4 pt-2">
          <div className="h-3 w-20 rounded bg-background/10" />
          <div className="h-3 w-24 rounded bg-background/10" />
        </div>
      </div>
    </div>
  );
};
