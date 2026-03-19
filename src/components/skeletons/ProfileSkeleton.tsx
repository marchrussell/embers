export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse bg-background pb-24">
      <div className="px-6 pt-16 md:pt-24">
        {/* Header: title + back button */}
        <div className="mb-12 flex items-center justify-between md:mb-16">
          <div className="h-9 w-48 rounded bg-[#E6DBC7]/15" />
          <div className="h-5 w-12 rounded bg-[#E6DBC7]/10" />
        </div>

        {/* Progress section */}
        <div className="mb-10 border-b border-[#E6DBC7]/10 pb-8 md:mb-12 md:pb-10">
          <div className="mb-6 h-3 w-28 rounded bg-[#E6DBC7]/10 md:mb-8" />
          <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mb-10 md:gap-x-10 md:gap-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="mb-2 h-12 w-16 rounded bg-[#E6DBC7]/15 md:mb-3 md:h-14" />
                <div className="h-3 w-24 rounded bg-[#E6DBC7]/10" />
              </div>
            ))}
          </div>
          <div className="h-4 w-48 rounded bg-[#E6DBC7]/10" />
        </div>

        {/* Account section */}
        <div className="mb-10 border-b border-[#E6DBC7]/10 pb-8 md:mb-12 md:pb-10">
          <div className="mb-6 h-3 w-20 rounded bg-[#E6DBC7]/10 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#E6DBC7]/8 h-12 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Information section */}
        <div className="mb-10 border-b border-[#E6DBC7]/10 pb-8 md:mb-12 md:pb-10">
          <div className="mb-6 h-3 w-28 rounded bg-[#E6DBC7]/10 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#E6DBC7]/8 h-12 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Data & Privacy section */}
        <div className="mb-10 md:mb-12">
          <div className="mb-6 h-3 w-32 rounded bg-[#E6DBC7]/10 md:mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#E6DBC7]/8 h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
