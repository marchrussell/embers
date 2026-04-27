import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { FadeUp } from "@/components/FadeUp";
import { GlowButton } from "@/components/ui/glow-button";
import SplitCard from "@/components/ui/split-card";

import { useCourses } from "./hooks/useCourses";

const CoursesTabContent = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();

  return (
    <div className="pb-64 pt-8 md:pt-[150px]">
      <FadeUp>
        <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
          Guided Courses
        </h2>
        <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
          Structured pathways for lasting change and integration.
        </p>
      </FadeUp>

      <div className="space-y-9 md:space-y-10 lg:space-y-12">
        {courses.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-xl text-[#E6DBC7]/60">Courses coming soon</p>
          </div>
        )}

        {courses.map((course, index) => (
          <FadeUp key={course.id} delay={index * 80}>
            <SplitCard
              imageSrc={course.image_url}
              imageAlt={course.title}
              breakpoint="lg"
              mobileLayout="stacked"
              contentClassName="bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6"
              onClick={() => course.slug && navigate(`/online/program/${course.slug}`)}
            >
              <div>
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E6DBC7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E6DBC7]" />
                    {course.slug === "nervous-system-reset"
                      ? "14-Day Flagship Reset"
                      : course.duration_days
                        ? `${course.duration_days}-Day Course`
                        : "Course"}
                  </span>
                </div>
                <h2 className="mb-3 font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] font-light leading-[1.2] tracking-[-0.01em] text-[#E6DBC7]">
                  {course.title}
                </h2>
                <p className="mb-4 max-w-[340px] font-editorial text-[14px] italic leading-[1.5] text-[#E6DBC7]/65 lg:text-[15px]">
                  {course.short_description || course.description}
                </p>
              </div>
              <div className="mt-8 flex justify-start lg:ml-auto lg:mr-8 lg:mt-10">
                <GlowButton size="sm">Start Course</GlowButton>
              </div>
            </SplitCard>
          </FadeUp>
        ))}
      </div>
    </div>
  );
};

const CoursesSkeleton = () => (
  <div className="pb-64 pt-8 md:pt-[150px]">
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/[0.08] lg:flex-row"
          style={{ minHeight: "400px" }}
        >
          <div className="h-[240px] shrink-0 bg-muted/20 lg:h-auto lg:min-h-full lg:w-[52%]" />
          <div className="relative flex flex-1 flex-col justify-center bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-muted/30" />
              <div className="h-3 w-28 rounded bg-muted/30" />
            </div>
            <div className="mb-3 h-8 w-3/4 rounded bg-muted/30" />
            <div className="h-16 max-w-[340px] rounded bg-muted/20" />
            <div className="mt-8 flex justify-start lg:ml-auto lg:mr-8 lg:mt-10">
              <div className="h-9 w-28 rounded-full bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CoursesTab = () => (
  <Suspense fallback={<CoursesSkeleton />}>
    <CoursesTabContent />
  </Suspense>
);

export default CoursesTab;
