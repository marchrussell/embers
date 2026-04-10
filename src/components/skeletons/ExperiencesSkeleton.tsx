import { NavBar } from "@/components/NavBar";

import { ExperienceCardSkeleton } from "./ExperienceCardSkeleton";

export const ExperiencesSkeleton = () => (
  <div className="flex min-h-screen flex-col bg-black">
    <NavBar />

    <main className="flex-1">
      {/* Hero - Desktop */}
      <section className="hidden px-6 pb-12 pt-48 md:block md:px-10 md:pb-16 md:pt-44 lg:px-12 lg:pb-20 lg:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-3 h-12 w-48 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </section>

      {/* Mobile spacer */}
      <div className="pt-44 md:hidden" />

      {/* Cards */}
      <section className="px-6 pb-40 md:px-10 md:pb-56 lg:px-12 lg:pb-72">
        <div className="mb-6 max-w-[1600px] md:hidden">
          <div className="mb-3 h-12 w-48 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="mx-auto max-w-[1600px] space-y-9 md:space-y-10 lg:space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <ExperienceCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  </div>
);
