export const AdminSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse bg-background p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 h-10 w-64 rounded bg-background/15" />
        <div className="h-4 w-96 rounded bg-background/10" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg bg-background/5 p-6">
            <div className="mb-4 h-6 w-3/4 rounded bg-background/15" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-background/10" />
              <div className="h-4 w-5/6 rounded bg-background/10" />
            </div>
            <div className="mt-6 h-10 w-full rounded bg-background/10" />
          </div>
        ))}
      </div>
    </div>
  );
};
