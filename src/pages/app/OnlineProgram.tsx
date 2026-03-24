import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Lock, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/lib/posthog";
import SessionDetailModal from "./SessionDetail";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import OnlineFooter from "@/components/OnlineFooter";
import { Footer } from "@/components/Footer";
import OnlineHeader from "@/components/OnlineHeader";

// Course images
import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import trialProgramImage from "@/assets/trial-program.webp";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  image_url: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  media_url: string;
  content_type: string;
}

const courseImages: Record<string, string> = {
  "breathwork-anxiety-reset": anxietyResetDandelion,
  "anxiety-reset": anxietyResetDandelion,
  "sleep-nsdr-pack": sleepNsdrMoon,
  "emotional-first-aid-kit": emotionalFirstAid,
  "nervous-system-reset": trialProgramImage,
};

const OnlineProgram = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, hasSubscription, isAdmin, isTestUser } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data, isLoading: loading, isError } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();

      if (courseError) throw courseError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseData.id)
        .eq("is_published", true)
        .order("order_index");

      if (lessonsError) throw lessonsError;

      return { course: courseData as Course, lessons: (lessonsData || []) as Lesson[] };
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (isError) toast.error("Unable to load program");
  }, [isError]);

  const course = data?.course ?? null;
  const lessons = data?.lessons ?? [];

  const handleLessonClick = (lessonId: string) => {
    // For now, show subscription modal if not subscribed
    if (!hasSubscription && !isAdmin && !isTestUser) {
      setShowSubscriptionModal(true);
    } else {
      if (course) analytics.courseStarted(course.id, course.title);
      setSelectedSessionId(lessonId);
    }
  };

  const courseImage = course ? courseImages[course.slug] || course.image_url : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center px-6 pt-44">
          <div className="animate-pulse text-[#E6DBC7]/60">Loading program...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="px-6 pt-44 text-center">
          <p className="text-xl text-[#E6DBC7]/60">Program not found</p>
          <button
            onClick={() => navigate("/online?tab=programs")}
            className="mt-4 text-[#EC9037] transition-colors hover:text-[#EC9037]/80"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Program Hero Header - matches StartHere layout exactly */}
      <div className="relative z-10 mt-[340px] h-[420px] md:mt-[380px]">
        {courseImage && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: `url('${courseImage}')` }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative flex h-full items-end px-6 pb-14 md:px-10 lg:px-12">
          <div className="w-full max-w-3xl">
            <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
              {lessons.length} Classes
            </p>
            <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">{course.title}</h1>
          </div>
        </div>
      </div>

      {/* Description - italic editorial style like category pages */}
      {(course.short_description || course.description) && (
        <div className="px-6 pb-8 pt-12 md:px-10 lg:px-12">
          <p className="max-w-4xl font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/70 md:text-2xl lg:text-3xl">
            {course.short_description || course.description}
          </p>
        </div>
      )}

      {/* Main Content - matches StartHere layout */}
      <div className="px-6 pb-24 pt-16 md:px-10 lg:px-12">
        <div className="grid gap-4">
          {lessons.map((lesson) => {
            const isLocked = !hasSubscription && !isAdmin && !isTestUser;

            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/10 transition-all hover:border-[#E6DBC7]/20 hover:shadow-[0_8px_30px_rgba(230,219,199,0.08)]"
              >
                <div className="flex items-stretch overflow-hidden rounded-xl bg-[#1a1a1a]/60 transition-all hover:bg-[#1a1a1a]/80">
                  {/* Square Thumbnail - matching category card proportions */}
                  <div
                    className="relative aspect-square w-[180px] flex-shrink-0 bg-cover bg-center md:w-[220px]"
                    style={{ backgroundImage: courseImage ? `url('${courseImage}')` : undefined }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Lock className="h-8 w-8 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info - centered vertically */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-6 md:px-8">
                    <h3 className="mb-2 font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="mb-2 line-clamp-2 text-sm font-light text-[#E6DBC7]/70 md:text-base">
                        {lesson.description}
                      </p>
                    )}
                    <p className="text-sm font-light text-[#E6DBC7]/50">
                      March Russell • {lesson.duration_minutes || 10} min
                    </p>
                  </div>

                  {/* Circular Play Button - right side */}
                  <div className="flex items-center pr-6 md:pr-8">
                    {isLocked ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E6DBC7]/20 md:h-14 md:w-14">
                        <Lock className="h-5 w-5 text-[#E6DBC7]/40" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonClick(lesson.id);
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E6DBC7]/30 transition-all hover:border-[#E6DBC7]/50 hover:bg-[#E6DBC7]/5 md:h-14 md:w-14"
                      >
                        <Play
                          className="ml-0.5 h-5 w-5 text-[#E6DBC7] md:h-6 md:w-6"
                          fill="currentColor"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {lessons.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#E6DBC7]/60">Classes coming soon</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-12">
        <OnlineFooter />
      </div>

      <Footer />

      {/* Modals */}
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
};

export default OnlineProgram;
