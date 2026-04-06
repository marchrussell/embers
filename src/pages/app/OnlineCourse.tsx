import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { CourseViewSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
import { Course } from "@/pages/app/online/types";

import SessionPlayCard from "./online/components/SessionPlayCard";
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
        .select(
          "id, title, description, short_description, duration_minutes, order_index, image_url, teacher_name"
        )
        .eq("program_id", programData.id)
        .order("order_index");

      if (classesError) throw classesError;

      return {
        course: programData as unknown as Course,
        lessons: (classesData ?? []) as ClassItem[],
      };
    },
    enabled: !!slug,
  });

  console.log("Course Data:", data);

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
    return <CourseViewSkeleton />;
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
        <div className="grid gap-4 md:gap-5">
          {lessons.map((lesson) => {
            const isLocked = !hasSubscription && !isAdmin && !isTestUser;

            return (
              <SessionPlayCard
                key={lesson.id}
                sessionId={lesson.id}
                title={lesson.title}
                description={lesson.short_description || lesson.description || ""}
                meta={`${lesson.teacher_name || course.teacher_name} • ${lesson.duration_minutes || 10} min`}
                imageUrl={lesson.image_url || course.image_url}
                onClick={() => handleLessonClick(lesson.id)}
                locked={isLocked}
              />
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
