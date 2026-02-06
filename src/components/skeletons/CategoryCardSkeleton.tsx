export const CategoryCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-lg aspect-square bg-white/[0.02] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="h-3 w-20 bg-white/[0.05] rounded mb-2" />
        <div className="h-4 w-32 bg-white/[0.07] rounded" />
      </div>
    </div>
  );
};
