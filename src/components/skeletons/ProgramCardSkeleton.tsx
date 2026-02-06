export const ProgramCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg h-64 bg-white/[0.02] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-transparent" />
      <div className="relative h-full flex items-center px-8">
        <div className="max-w-xl space-y-4">
          <div className="h-3 w-32 bg-white/[0.05] rounded" />
          <div className="h-6 w-64 bg-white/[0.07] rounded" />
          <div className="h-4 w-48 bg-white/[0.05] rounded" />
          <div className="h-8 w-32 bg-white/[0.05] rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
};
