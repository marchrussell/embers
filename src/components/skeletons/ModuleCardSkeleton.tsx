export const ModuleCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-lg bg-background/5 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 h-6 w-48 rounded bg-background/15" />
          <div className="h-4 w-32 rounded bg-background/10" />
        </div>
        <div className="h-8 w-8 rounded-full bg-background/10" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-background/10" />
        <div className="h-4 w-5/6 rounded bg-background/10" />
      </div>

      <div className="mt-6 border-t border-background/10 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-background/10" />
          <div className="h-8 w-24 rounded-full bg-background/10" />
        </div>
      </div>
    </div>
  );
};
