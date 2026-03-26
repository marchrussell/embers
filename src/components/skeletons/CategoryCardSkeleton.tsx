export const CategoryCardSkeleton = () => {
  return (
    <div className="relative h-56 animate-pulse overflow-hidden rounded-2xl border border-[#E6DBC7]/10 bg-white/[0.02] shadow-glow md:h-64">
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="mb-2 h-3 w-20 rounded bg-white/[0.05]" />
        <div className="h-4 w-32 rounded bg-white/[0.07]" />
      </div>
    </div>
  );
};
