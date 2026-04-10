import { SkeletonBox, SkeletonButton, SkeletonCircle, SkeletonLine } from "./SkeletonPrimitives";

export const ExperienceCardSkeleton = () => (
  <div
    className="relative flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/[0.08] lg:flex-row"
    style={{ minHeight: "340px" }}
  >
    {/* Image placeholder */}
    <div className="relative h-[240px] shrink-0 bg-white/[0.04] lg:h-auto lg:min-h-full lg:w-[52%]" />

    {/* Content placeholder */}
    <div className="flex flex-1 flex-col justify-center bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6">
      {/* Format badge */}
      <SkeletonLine width="1/3" height="3" className="mb-5" />

      {/* Title */}
      <SkeletonLine width="3/4" height="8" variant="title" className="mb-3" />

      {/* Subtitle */}
      <SkeletonBox className="mb-6 h-10 w-[340px] max-w-full rounded" />

      {/* Next event label */}
      <SkeletonLine width="1/4" height="3" className="mb-1.5" />
      {/* Date */}
      <SkeletonLine width="1/2" height="4" className="mb-2" />

      {/* Cadence */}
      <SkeletonLine width="2/3" height="3" className="mb-5" />

      {/* Icon buttons */}
      <div className="flex items-center gap-4">
        <SkeletonCircle size="lg" />
        <SkeletonCircle size="lg" />
      </div>

      {/* CTA */}
      <div className="mt-8 lg:ml-auto lg:mr-8 lg:mt-10">
        <SkeletonButton className="w-36" />
      </div>
    </div>
  </div>
);
