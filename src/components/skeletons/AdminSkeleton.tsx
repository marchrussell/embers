export const AdminSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-background/15 rounded mb-4" />
        <div className="h-4 w-96 bg-background/10 rounded" />
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-background/5 rounded-lg p-6">
            <div className="h-6 w-3/4 bg-background/15 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-background/10 rounded" />
              <div className="h-4 w-5/6 bg-background/10 rounded" />
            </div>
            <div className="mt-6 h-10 w-full bg-background/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
