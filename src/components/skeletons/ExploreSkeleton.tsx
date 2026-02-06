import { Skeleton } from "@/components/ui/skeleton";

export const ExploreSkeleton = () => {
  return (
    <main className="flex-1 animate-in fade-in duration-500">
      {/* Hero Section Skeleton - Full viewport height like actual */}
      <section className="relative min-h-screen flex items-end bg-black">
        {/* Background gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#0d0a08] to-black" />
        
        {/* Bottom text area */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-8 sm:left-12 md:left-16 right-4 sm:right-6 md:right-8 z-10">
          <Skeleton className="h-10 sm:h-12 md:h-14 w-[90%] md:w-[70%] mb-4 bg-[#E6DBC7]/10" />
          <Skeleton className="h-5 sm:h-6 w-[80%] md:w-[50%] bg-[#E6DBC7]/8" />
        </div>
      </section>

      {/* The Studio Section Skeleton */}
      <section className="pt-20 md:pt-28 lg:pt-36 pb-16 md:pb-24 bg-black">
        <div className="mx-auto px-6 md:px-12 lg:px-20 w-full">
          {/* Header - Centered */}
          <div className="mb-12 md:mb-20 text-center max-w-[52rem] mx-auto">
            <Skeleton className="h-12 md:h-16 w-48 md:w-64 mx-auto mb-4 bg-[#E6DBC7]/10" />
            <Skeleton className="h-6 md:h-8 w-full max-w-lg mx-auto mb-8 bg-[#E6DBC7]/8" />
            
            {/* Bullet points */}
            <div className="flex flex-col items-center gap-3 md:gap-4 mb-12">
              {[1, 2, 3].map((i) => (
                <Skeleton 
                  key={i} 
                  className="h-4 w-64 md:w-80 bg-[#E6DBC7]/8"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Phone Mockups placeholder */}
          <div className="flex justify-center gap-4 md:gap-6 mb-16">
            <Skeleton className="h-[300px] md:h-[400px] w-[140px] md:w-[180px] rounded-2xl bg-[#E6DBC7]/8" />
            <Skeleton className="hidden md:block h-[350px] md:h-[450px] w-[180px] md:w-[200px] rounded-2xl bg-[#E6DBC7]/8" />
            <Skeleton className="hidden lg:block h-[300px] md:h-[400px] w-[140px] md:w-[180px] rounded-2xl bg-[#E6DBC7]/8" />
          </div>

          {/* CTA */}
          <div className="text-center">
            <Skeleton className="h-14 w-48 md:w-56 mx-auto rounded-full bg-[#E6DBC7]/10" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="py-20 md:py-28 bg-black px-6 md:px-10 lg:px-12">
        <div className="h-[1px] w-full max-w-[1600px] mx-auto bg-[#E6DBC7]/20" />
      </div>

      {/* Short Courses Section Skeleton */}
      <section className="pb-20 md:pb-28 bg-black">
        <div className="mx-auto px-6 md:px-8 lg:px-10 max-w-[1600px]">
          <div className="mb-12 md:mb-16 text-center">
            <Skeleton className="h-12 md:h-16 w-48 md:w-64 mx-auto mb-4 bg-[#E6DBC7]/10" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto bg-[#E6DBC7]/8" />
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-[1200px] mx-auto">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="rounded-xl border border-white/[0.08] overflow-hidden bg-black/40"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Skeleton className="aspect-[4/3] w-full bg-[#E6DBC7]/8" />
                <div className="p-4 lg:p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/10" />
                  <Skeleton className="h-4 w-1/3 bg-[#E6DBC7]/8" />
                  <Skeleton className="h-4 w-1/2 bg-[#E6DBC7]/8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rise ARC Hero placeholder */}
      <section className="relative w-full h-[40vh] md:h-[50vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1410] to-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto mb-4 bg-[#E6DBC7]/10" />
            <Skeleton className="h-12 md:h-16 w-64 md:w-96 mx-auto mb-3 bg-[#E6DBC7]/10" />
            <Skeleton className="h-6 w-40 mx-auto bg-[#E6DBC7]/8" />
          </div>
        </div>
      </section>

      {/* ARC Program Cards */}
      <section className="py-12 md:py-16 bg-black">
        <div className="mx-auto px-4 md:px-6 lg:px-8 max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton 
                key={i} 
                className="h-[320px] md:h-[380px] rounded-sm bg-[#E6DBC7]/8"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
