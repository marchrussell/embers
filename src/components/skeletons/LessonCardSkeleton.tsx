export const LessonCardSkeleton = () => {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-lg bg-background/5 p-4">
      {/* Thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 rounded bg-background/10" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 rounded bg-background/15" />
        <div className="h-3 w-32 rounded bg-background/10" />
      </div>

      {/* Icon */}
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-background/10" />
    </div>
  );
};
