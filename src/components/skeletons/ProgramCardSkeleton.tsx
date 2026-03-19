export const ProgramCardSkeleton = () => {
  return (
    <div className="group relative h-64 animate-pulse overflow-hidden rounded-lg bg-white/[0.02]">
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-transparent" />
      <div className="relative flex h-full items-center px-8">
        <div className="max-w-xl space-y-4">
          <div className="h-3 w-32 rounded bg-white/[0.05]" />
          <div className="h-6 w-64 rounded bg-white/[0.07]" />
          <div className="h-4 w-48 rounded bg-white/[0.05]" />
          <div className="mt-4 h-8 w-32 rounded-full bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
};
