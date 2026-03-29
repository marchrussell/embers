import { useQuery } from "@tanstack/react-query";
import { Lock, Play } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { CoursePlayerSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
import { Course } from "@/pages/app/online/types";

import SessionDetailModal from "./SessionDetail";

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  image_url: string | null;
  teacher_name: string | null;
}

const OnlineCourse = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { hasSubscription, isAdmin, isTestUser } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();

      if (programError) throw programError;

      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, title, description, short_description, duration_minutes, order_index, image_url, teacher_name")
        .eq("program_id", programData.id)
        .eq("is_published", true)
        .order("order_index");

      if (classesError) throw classesError;

      return {
        course: programData as unknown as Course,
        lessons: (classesData ?? []) as ClassItem[],
      };
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (isError) toast.error("Unable to load course");
  }, [isError]);

  const course = data?.course ?? null;
  const lessons = data?.lessons ?? [];

  const handleLessonClick = (lessonId: string) => {
    if (!hasSubscription && !isAdmin && !isTestUser) {
      setShowSubscriptionModal(true);
    } else {
      if (course) analytics.courseStarted(course.id, course.title);
      setSelectedSessionId(lessonId);
    }
  };

  if (loading) {
    return <CoursePlayerSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="px-6 pt-44 text-center">
          <p className="text-xl text-[#E6DBC7]/60">Course not found</p>
          <button
            onClick={() => navigate("/online?tab=courses")}
            className="mt-4 text-[#EC9037] transition-colors hover:text-[#EC9037]/80"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Program Hero Header */}
      <div className="relative z-10 mt-[340px] h-[420px] md:mt-[380px]">
        {course.image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: `url('${course.image_url}')` }}
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

      {/* Description */}
      {(course.short_description || course.description) && (
        <div className="px-6 pb-8 pt-12 md:px-10 lg:px-12">
          <p className="max-w-4xl font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/70 md:text-2xl lg:text-3xl">
            {course.short_description || course.description}
          </p>
        </div>
      )}

      {/* Classes List */}
      <div className="px-6 pb-24 pt-16 md:px-10 lg:px-12">
        <div className="grid gap-4">
          {lessons.map((lesson) => {
            const isLocked = !hasSubscription && !isAdmin && !isTestUser;
            const thumbnail = lesson.image_url || course.image_url;

            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/10 transition-all hover:border-[#E6DBC7]/20 hover:shadow-[0_8px_30px_rgba(230,219,199,0.08)]"
              >
                <div className="flex items-stretch overflow-hidden rounded-xl bg-[#1a1a1a]/60 transition-all hover:bg-[#1a1a1a]/80">
                  {/* Square Thumbnail */}
                  <div
                    className="relative aspect-square w-[180px] flex-shrink-0 bg-cover bg-center md:w-[220px]"
                    style={{ backgroundImage: thumbnail ? `url('${thumbnail}')` : undefined }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Lock className="h-8 w-8 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-6 md:px-8">
                    <h3 className="mb-2 font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                      {lesson.title}
                    </h3>
                    {(lesson.short_description || lesson.description) && (
                      <p className="mb-2 line-clamp-2 text-sm font-light text-[#E6DBC7]/70 md:text-base">
                        {lesson.short_description || lesson.description}
                      </p>
                    )}
                    <p className="text-sm font-light text-[#E6DBC7]/50">
                      {lesson.teacher_name || course.teacher_name} • {lesson.duration_minutes || 10} min
                    </p>
                  </div>

                  {/* Play / Lock button */}
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

export default OnlineCourse;
