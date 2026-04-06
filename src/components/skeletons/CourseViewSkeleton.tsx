import { Skeleton } from "@/components/ui/skeleton";

export const CourseViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero — matches OnlineCourse: mt-[340px] h-[420px] md:mt-[380px] */}
      <div className="relative z-10 mt-[340px] h-[420px] md:mt-[380px]">
        <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative flex h-full items-end px-6 pb-14 md:px-10 lg:px-12">
          <div className="w-full max-w-3xl space-y-3">
            {/* Lesson count line */}
            <Skeleton className="h-3 w-24 bg-[#E6DBC7]/10" />
            {/* Title */}
            <Skeleton className="h-14 w-2/3 bg-[#E6DBC7]/15" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-8 pt-12 md:px-10 lg:px-12">
        <Skeleton className="h-7 w-3/4 max-w-4xl bg-[#E6DBC7]/10" />
      </div>

      {/* Classes list */}
      <div className="px-6 pb-24 pt-16 md:px-10 lg:px-12">
        <div className="grid gap-4 md:gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex h-[140px] overflow-hidden rounded-xl border border-[#E6DBC7]/10 md:h-[160px] lg:h-[180px]"
            >
              {/* Image */}
              <Skeleton className="h-full w-[140px] flex-shrink-0 rounded-none bg-[#E6DBC7]/10 md:w-[200px] lg:w-[240px]" />

              {/* Content */}
              <div className="flex flex-1 items-center justify-between gap-4 px-6 py-6 md:px-10">
                <div className="min-w-0 flex-1 space-y-2 pr-4">
                  <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/15" />
                  <Skeleton className="h-4 w-full bg-[#E6DBC7]/10" />
                  <Skeleton className="h-4 w-2/3 bg-[#E6DBC7]/10" />
                  <Skeleton className="bg-[#E6DBC7]/8 h-3 w-1/3" />
                </div>

                {/* Action buttons */}
                <div className="flex flex-shrink-0 items-center gap-2 md:gap-3">
                  <Skeleton className="h-11 w-11 rounded-full bg-[#E6DBC7]/10 md:h-14 md:w-14" />
                  <Skeleton className="h-11 w-11 rounded-full bg-[#E6DBC7]/10 md:h-14 md:w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
