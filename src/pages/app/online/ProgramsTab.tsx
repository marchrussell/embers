import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import trialProgramImage from "@/assets/trial-program.webp";
import { GlowButton } from "@/components/ui/glow-button";
import { useNavigate } from "react-router-dom";
import { useCourses } from "./hooks/useCourses";

const courseImages: Record<string, string> = {
  'breathwork-anxiety-reset': anxietyResetDandelion,
  'anxiety-reset': anxietyResetDandelion,
  'sleep-nsdr-pack': sleepNsdrMoon,
  'emotional-first-aid-kit': emotionalFirstAid,
  'nervous-system-reset': trialProgramImage,
};

const ProgramsTab = () => {
  const navigate = useNavigate();
  const { courses, isLoading } = useCourses();

  return (
    <div className="pt-8 md:pt-[150px] pb-64">
      <div>
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Guided Courses</h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          Structured pathways for lasting change and integration.
        </p>
      </div>

      <div className="space-y-9 md:space-y-10 lg:space-y-12">
        {isLoading && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.08] animate-pulse"
                style={{ minHeight: '400px' }}
              >
                <div className="lg:w-[52%] h-[240px] lg:h-auto bg-muted/20" />
                <div className="flex-1 p-8 space-y-4 bg-black/50">
                  <div className="h-4 w-32 bg-muted/30 rounded" />
                  <div className="h-8 w-3/4 bg-muted/30 rounded" />
                  <div className="h-16 w-full bg-muted/20 rounded" />
                  <div className="h-10 w-32 bg-muted/30 rounded-full mt-8" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#E6DBC7]/60 text-xl">Programs coming soon</p>
          </div>
        )}

        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/online/program/${course.slug}`)}
            className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
            style={{
              minHeight: '400px',
              background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)',
            }}
          >
            <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
              <img
                src={courseImages[course.slug] || course.image_url || ''}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 hidden lg:block"
                style={{ background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)' }}
              />
              <div
                className="absolute inset-0 lg:hidden"
                style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)' }}
              />
            </div>

            <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
              <div>
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                    {course.slug === 'nervous-system-reset'
                      ? '14-Day Flagship Reset'
                      : `${course.duration_days}-Day Course`}
                  </span>
                </div>
                <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                  {course.title}
                </h2>
                <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                  {course.short_description || course.description}
                </p>
              </div>
              <div className="flex justify-start mt-8 lg:mt-10 lg:ml-auto lg:mr-8">
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
