export const LessonCardSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-background/5 rounded-lg animate-pulse">
      {/* Thumbnail */}
      <div className="w-20 h-20 bg-background/10 rounded flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-background/15 rounded" />
        <div className="h-3 w-32 bg-background/10 rounded" />
      </div>
      
      {/* Icon */}
      <div className="w-8 h-8 bg-background/10 rounded-full flex-shrink-0" />
    </div>
  );
};
