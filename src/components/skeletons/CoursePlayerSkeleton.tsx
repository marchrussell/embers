import { Skeleton } from "@/components/ui/skeleton";

export const CoursePlayerSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="relative h-[50vh]">
        <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Skeleton className="h-10 w-2/3 mb-4 bg-[#E6DBC7]/15" />
          <Skeleton className="h-5 w-96 max-w-full bg-[#E6DBC7]/10" />
        </div>
      </div>
      
      {/* Lessons list */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-6 bg-[#E6DBC7]/10" />
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-[#E6DBC7]/10">
              <Skeleton className="w-16 h-16 rounded bg-[#E6DBC7]/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-[#E6DBC7]/15" />
                <Skeleton className="h-4 w-1/3 bg-[#E6DBC7]/10" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full bg-[#E6DBC7]/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
