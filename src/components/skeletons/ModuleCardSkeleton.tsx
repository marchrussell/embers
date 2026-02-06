export const ModuleCardSkeleton = () => {
  return (
    <div className="bg-background/5 rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 w-48 bg-background/15 rounded mb-2" />
          <div className="h-4 w-32 bg-background/10 rounded" />
        </div>
        <div className="w-8 h-8 bg-background/10 rounded-full" />
      </div>
      
      <div className="space-y-2 mt-4">
        <div className="h-4 w-full bg-background/10 rounded" />
        <div className="h-4 w-5/6 bg-background/10 rounded" />
      </div>
      
      <div className="mt-6 pt-4 border-t border-background/10">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-background/10 rounded" />
          <div className="h-8 w-24 bg-background/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};
