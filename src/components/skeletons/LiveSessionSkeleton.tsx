import { Calendar, Clock } from "lucide-react";

import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";

export const LiveSessionSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Hero */}
      <div className="relative z-10 h-[500px] md:mt-[380px]">
        <Skeleton className="absolute inset-0 bg-[#E6DBC7]/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative flex h-full items-end justify-center px-6 pb-14 md:px-10 lg:px-12">
          <div className="flex w-full flex-col items-center gap-3">
            <Skeleton className="h-3.5 w-32 bg-[#E6DBC7]/10" />
            <Skeleton className="h-12 w-72 bg-[#E6DBC7]/15 md:w-96" />
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-8 px-6 pb-6 pt-10">
        <span className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-[#E6DBC7]/20" />
          <Skeleton className="h-4 w-20 bg-[#E6DBC7]/10" />
        </span>
        <span className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#E6DBC7]/20" />
          <Skeleton className="h-4 w-40 bg-[#E6DBC7]/10" />
        </span>
      </div>

      {/* Description */}
      <div className="px-6 pb-16 pt-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-3 text-center">
          <Skeleton className="bg-[#E6DBC7]/8 mx-auto h-7 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-7 w-3/4 max-w-xl bg-[#E6DBC7]/5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-40 md:px-10 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Facilitator + What to expect card */}
          <div className="mb-36 mt-32 flex flex-col overflow-hidden rounded-2xl border border-[#E6DBC7]/20 md:flex-row">
            {/* Image placeholder */}
            <div className="relative flex-shrink-0 md:w-1/2">
              <Skeleton className="bg-[#E6DBC7]/8 h-80 w-full rounded-none md:absolute md:inset-0 md:h-full" />
            </div>

            {/* What to expect placeholder */}
            <div className="flex flex-col justify-center p-10 md:w-1/2">
              <Skeleton className="mb-2 h-8 w-48 bg-[#E6DBC7]/15" />
              <Skeleton className="mb-6 h-3 w-36 bg-[#E6DBC7]/10" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="mt-0.5 h-3 w-3 flex-shrink-0 bg-[#E6DBC7]/10" />
                    <Skeleton className={`bg-[#E6DBC7]/8 h-3 ${i === 4 ? "w-2/3" : "w-full"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Countdown box */}
          <div className="relative mx-auto flex aspect-[16/9] max-w-6xl items-center justify-center overflow-hidden rounded-2xl border border-[#E6DBC7]/10">
            <Skeleton className="absolute inset-0 rounded-none bg-[#E6DBC7]/5" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-8 text-center">
              <Skeleton className="mx-auto mb-6 h-4 w-48 bg-[#E6DBC7]/10" />
              <div className="mb-12 flex items-center justify-center gap-4 md:gap-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 md:gap-8">
                    <div className="text-center">
                      <Skeleton className="mb-1 h-12 w-14 bg-[#E6DBC7]/15 md:h-16 md:w-16 lg:h-20 lg:w-20" />
                      <Skeleton className="bg-[#E6DBC7]/8 mx-auto mt-1 h-2.5 w-8" />
                    </div>
                    {i < 3 && <Skeleton className="h-8 w-3 bg-[#E6DBC7]/10 md:h-10" />}
                  </div>
                ))}
              </div>
              <Skeleton className="mx-auto h-4 w-56 bg-[#E6DBC7]/10" />
            </div>
          </div>
        </div>

        <OnlineFooter />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};
