import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import trialProgramImage from "@/assets/trial-program.webp";
import { GlowButton } from "@/components/ui/glow-button";
import { useNavigate } from "react-router-dom";
import { useCourses } from "./hooks/useCourses";

const courseImages: Record<string, string> = {
  "breathwork-anxiety-reset": anxietyResetDandelion,
  "anxiety-reset": anxietyResetDandelion,
  "sleep-nsdr-pack": sleepNsdrMoon,
  "emotional-first-aid-kit": emotionalFirstAid,
  "nervous-system-reset": trialProgramImage,
};

const ProgramsTab = () => {
  const navigate = useNavigate();
  const { courses, isLoading } = useCourses();

  return (
    <div className="pb-64 pt-8 md:pt-[150px]">
      <div>
        <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
          Guided Courses
        </h2>
        <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
          Structured pathways for lasting change and integration.
        </p>
      </div>

      <div className="space-y-9 md:space-y-10 lg:space-y-12">
        {isLoading && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/[0.08] lg:flex-row"
                style={{ minHeight: "400px" }}
              >
                <div className="h-[240px] bg-muted/20 lg:h-auto lg:w-[52%]" />
                <div className="flex-1 space-y-4 bg-black/50 p-8">
                  <div className="h-4 w-32 rounded bg-muted/30" />
                  <div className="h-8 w-3/4 rounded bg-muted/30" />
                  <div className="h-16 w-full rounded bg-muted/20" />
                  <div className="mt-8 h-10 w-32 rounded-full bg-muted/30" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-xl text-[#E6DBC7]/60">Programs coming soon</p>
          </div>
        )}

        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/online/program/${course.slug}`)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_0_60px_rgba(230,219,199,0.4)] transition-colors duration-500 hover:border-white/25 lg:flex-row"
            style={{
              minHeight: "400px",
              background: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)",
            }}
          >
            <div className="relative h-[240px] shrink-0 overflow-hidden lg:h-auto lg:min-h-full lg:w-[52%]">
              <img
                src={courseImages[course.slug] || course.image_url || ""}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  background:
                    "linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)",
                }}
              />
              <div
                className="absolute inset-0 lg:hidden"
                style={{
                  background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)",
                }}
              />
            </div>

            <div className="relative flex flex-1 flex-col justify-center bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6">
              <div>
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E6DBC7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E6DBC7]" />
                    {course.slug === "nervous-system-reset"
                      ? "14-Day Flagship Reset"
                      : `${course.duration_days}-Day Course`}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramsTab;
