export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-24 animate-pulse">
      <div className="px-6 pt-64">
        {/* Profile header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-background/10" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-background/15 rounded" />
              <div className="h-4 w-64 bg-background/10 rounded" />
            </div>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background/5 rounded-lg p-6">
              <div className="h-4 w-16 bg-background/10 rounded mb-2" />
              <div className="h-8 w-12 bg-background/15 rounded" />
            </div>
          ))}
        </div>
        
        {/* Settings sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background/5 rounded-lg p-6">
              <div className="h-5 w-32 bg-background/15 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-background/10 rounded" />
                <div className="h-4 w-3/4 bg-background/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
