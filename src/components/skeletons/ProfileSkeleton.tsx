export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-24 animate-pulse">
      <div className="px-6 pt-16 md:pt-24">
        {/* Header: title + back button */}
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <div className="h-9 w-48 bg-[#E6DBC7]/15 rounded" />
          <div className="h-5 w-12 bg-[#E6DBC7]/10 rounded" />
        </div>

        {/* Progress section */}
        <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
          <div className="h-3 w-28 bg-[#E6DBC7]/10 rounded mb-6 md:mb-8" />
          <div className="grid grid-cols-2 gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-10 mb-8 md:mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-12 md:h-14 w-16 bg-[#E6DBC7]/15 rounded mb-2 md:mb-3" />
                <div className="h-3 w-24 bg-[#E6DBC7]/10 rounded" />
              </div>
            ))}
          </div>
          <div className="h-4 w-48 bg-[#E6DBC7]/10 rounded" />
        </div>

        {/* Account section */}
        <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
          <div className="h-3 w-20 bg-[#E6DBC7]/10 rounded mb-6 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#E6DBC7]/8 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Information section */}
        <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
          <div className="h-3 w-28 bg-[#E6DBC7]/10 rounded mb-6 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#E6DBC7]/8 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Data & Privacy section */}
        <div className="mb-10 md:mb-12">
          <div className="h-3 w-32 bg-[#E6DBC7]/10 rounded mb-6 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[#E6DBC7]/8 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
