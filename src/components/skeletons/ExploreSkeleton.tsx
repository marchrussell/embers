import { Skeleton } from "@/components/ui/skeleton";

export const ExploreSkeleton = () => {
  return (
    <main className="flex-1 duration-500 animate-in fade-in">
      {/* Hero Section Skeleton - Full viewport height like actual */}
      <section className="relative flex min-h-screen items-end bg-black">
        {/* Background gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#0d0a08] to-black" />

        {/* Bottom text area */}
        <div className="absolute bottom-6 left-8 right-4 z-10 sm:bottom-8 sm:left-12 sm:right-6 md:bottom-10 md:left-16 md:right-8">
          <Skeleton className="mb-4 h-10 w-[90%] bg-[#E6DBC7]/10 sm:h-12 md:h-14 md:w-[70%]" />
          <Skeleton className="bg-[#E6DBC7]/8 h-5 w-[80%] sm:h-6 md:w-[50%]" />
        </div>
      </section>

      {/* The Studio Section Skeleton */}
      <section className="bg-black pb-16 pt-20 md:pb-24 md:pt-28 lg:pt-36">
        <div className="mx-auto w-full px-6 md:px-12 lg:px-20">
          {/* Header - Centered */}
          <div className="mx-auto mb-12 max-w-[52rem] text-center md:mb-20">
            <Skeleton className="mx-auto mb-4 h-12 w-48 bg-[#E6DBC7]/10 md:h-16 md:w-64" />
            <Skeleton className="bg-[#E6DBC7]/8 mx-auto mb-8 h-6 w-full max-w-lg md:h-8" />

            {/* Bullet points */}
            <div className="mb-12 flex flex-col items-center gap-3 md:gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="bg-[#E6DBC7]/8 h-4 w-64 md:w-80"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Phone Mockups placeholder */}
          <div className="mb-16 flex justify-center gap-4 md:gap-6">
            <Skeleton className="bg-[#E6DBC7]/8 h-[300px] w-[140px] rounded-2xl md:h-[400px] md:w-[180px]" />
            <Skeleton className="bg-[#E6DBC7]/8 hidden h-[350px] w-[180px] rounded-2xl md:block md:h-[450px] md:w-[200px]" />
            <Skeleton className="bg-[#E6DBC7]/8 hidden h-[300px] w-[140px] rounded-2xl md:h-[400px] md:w-[180px] lg:block" />
          </div>

          {/* CTA */}
          <div className="text-center">
            <Skeleton className="mx-auto h-14 w-48 rounded-full bg-[#E6DBC7]/10 md:w-56" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-black px-6 py-20 md:px-10 md:py-28 lg:px-12">
        <div className="mx-auto h-[1px] w-full max-w-[1600px] bg-[#E6DBC7]/20" />
      </div>

      {/* Short Courses Section Skeleton */}
      <section className="bg-black pb-20 md:pb-28">
        <div className="mx-auto max-w-[1600px] px-6 md:px-8 lg:px-10">
          <div className="mb-12 text-center md:mb-16">
            <Skeleton className="mx-auto mb-4 h-12 w-48 bg-[#E6DBC7]/10 md:h-16 md:w-64" />
            <Skeleton className="bg-[#E6DBC7]/8 mx-auto h-6 w-full max-w-xl" />
          </div>

          {/* Course Cards Grid */}
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/40"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Skeleton className="bg-[#E6DBC7]/8 aspect-[4/3] w-full" />
                <div className="space-y-3 p-4 lg:p-5">
                  <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/10" />
                  <Skeleton className="bg-[#E6DBC7]/8 h-4 w-1/3" />
                  <Skeleton className="bg-[#E6DBC7]/8 h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rise ARC Hero placeholder */}
      <section className="relative h-[40vh] w-full bg-black md:h-[50vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1410] to-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-4 w-32 bg-[#E6DBC7]/10" />
            <Skeleton className="mx-auto mb-3 h-12 w-64 bg-[#E6DBC7]/10 md:h-16 md:w-96" />
            <Skeleton className="bg-[#E6DBC7]/8 mx-auto h-6 w-40" />
          </div>
        </div>
      </section>

      {/* ARC Program Cards */}
      <section className="bg-black py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="bg-[#E6DBC7]/8 h-[320px] rounded-sm md:h-[380px]"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
