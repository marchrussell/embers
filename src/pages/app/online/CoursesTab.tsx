import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FadeUp } from "@/components/FadeUp";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import OnlineTabLayout from "@/components/OnlineTabLayout";
import { GlowButton } from "@/components/ui/glow-button";
import SplitCard from "@/components/ui/split-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

import SessionsListLayout from "../library/SessionsListLayout";
import { LibrarySession } from "../library/types";
import SessionDetailModal from "../SessionDetail";
import { useCourses } from "./hooks/useCourses";
import { Course } from "./types";

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

// --- Course Detail View ---

const CourseDetailContent = ({ slug }: { slug: string }) => {
  const navigate = useNavigate();
  const { hasSubscription, isAdmin, isTestUser } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data } = useSuspenseQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
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
  });

  const { course, lessons } = data;
  const isLocked = !hasSubscription && !isAdmin && !isTestUser;

  const sessions: LibrarySession[] = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.short_description || lesson.description || undefined,
    duration: lesson.duration_minutes || 10,
    teacher: lesson.teacher_name || course.teacher_name || "",
    image: lesson.image_url || course.image_url,
    locked: isLocked,
    order_index: lesson.order_index,
  }));

  return (
    <>
      <SessionsListLayout
        image={course.image_url}
        title={course.title}
        description={course.short_description || course.description}
        countLabel={`${lessons.length} Classes`}
        sessions={sessions}
        isEmbedded
        hasSubscription={hasSubscription}
        onBack={() => navigate("/online?tab=courses", { replace: true })}
        onSessionClick={(id) => {
          analytics.courseStarted(course.id, course.title);
          setSelectedSessionId(id);
        }}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
      />
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
    </>
  );
};

// --- Courses List View ---

const CoursesListContent = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();

  return (
    <OnlineTabLayout className="pb-64">
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
              onClick={() => course.slug && navigate(`/online?tab=courses&course=${course.slug}`)}
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
    </OnlineTabLayout>
  );
};

// --- Skeleton ---

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

// --- Root ---

const CoursesTab = () => {
  const [searchParams] = useSearchParams();
  const courseSlug = searchParams.get("course");

  if (courseSlug) {
    return (
      <Suspense fallback={<CoursesSkeleton />}>
        <CourseDetailContent slug={courseSlug} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<CoursesSkeleton />}>
      <CoursesListContent />
    </Suspense>
  );
};

export default CoursesTab;
