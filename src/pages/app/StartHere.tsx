import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { WeeklyResetCard } from "@/components/WeeklyResetCard";
import { supabase } from "@/integrations/supabase/client";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";
import { FeaturedSession } from "@/pages/app/online/types";
import SessionDetailModal from "@/pages/app/SessionDetail";

const startHereButterfly = getCloudImageUrl(CLOUD_IMAGES.startHereButterfly);

const StartHere = () => {
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { data: sessions = [] } = useQuery<FeaturedSession[]>({
    queryKey: ["start-here-sessions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select(
          "id, title, duration_minutes, image_url, short_description, description, teacher_name, intensity, technique"
        )
        .not("start_here_position", "is", null)
        .order("start_here_position");
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Hero Section - positioned to start where tab content begins */}
      <div className="relative z-10 mt-[160px] h-[280px] sm:mt-[320px] sm:h-[380px] md:mt-[380px] md:h-[420px]">
        <img
          src={startHereButterfly}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative flex h-full items-end px-6 pb-16 md:px-10 lg:px-12">
          <div className="w-full">
            <p className="mb-2 text-xs font-light uppercase tracking-[0.15em] text-[#D4A574] sm:mb-3 sm:text-sm">
              Your First Two Weeks
            </p>
            <h1 className="font-editorial text-3xl text-[#E6DBC7] sm:text-4xl md:text-5xl lg:text-6xl">
              A Simple Place to Begin
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-16 pt-10 sm:pb-20 sm:pt-14 md:px-10 md:pb-24 md:pt-16 lg:px-12">
        {/* Subtitle - moved below hero */}
        <p className="mb-8 font-editorial text-lg italic leading-relaxed text-[#E6DBC7]/80 sm:mb-16 sm:text-xl md:text-2xl">
          No pressure. No expectations. Just a gentle way to arrive.
        </p>

        {/* Introduction Text - no box */}
        <div className="mb-10 max-w-3xl text-sm font-light leading-relaxed text-white sm:mb-20 sm:text-base md:mb-28 md:text-lg">
          <p>
            This space is designed to help you arrive gently and find your footing — without
            pressure or expectation. If all you do in your first two weeks is try these few
            practices and come to the Weekly Reset, that's more than enough.
          </p>
        </div>

        {/* Section 1: Recommended Practices */}
        <div className="mb-16 sm:mb-20 md:mb-28">
          <div className="mb-6 flex items-baseline gap-3 sm:gap-5">
            <span className="font-editorial text-xl text-white sm:text-2xl md:text-3xl">1</span>
            <h2 className="font-editorial text-xl font-light text-[#E6DBC7] sm:text-2xl md:text-3xl">
              Try These First
            </h2>
          </div>
          <p className="mb-8 ml-7 text-xs font-light text-[#E6DBC7]/50 sm:mb-10 sm:ml-10 sm:text-sm md:mb-12 md:text-base">
            Two gentle practices to help you settle in
          </p>

          <div className="grid gap-6">
            {sessions.map((session) => (
              <SessionPlayCard
                key={session.id}
                sessionId={session.id}
                title={session.title}
                description={session.short_description || session.description || ""}
                meta={[
                  session.teacher_name,
                  session.duration_minutes != null && `${session.duration_minutes} min`,
                  session.intensity,
                  session.technique,
                ]
                  .filter(Boolean)
                  .join(" • ")}
                imageUrl={session.image_url || ""}
                onClick={() => setSelectedSessionId(session.id)}
                mobileStacked
              />
            ))}
          </div>
        </div>

        {/* Section 2: Weekly Reset */}
        <div className="mb-10 sm:mb-20 md:mb-28">
          <div className="mb-3 flex items-baseline gap-3 sm:mb-4 sm:gap-5">
            <span className="font-editorial text-xl text-white sm:text-2xl md:text-3xl">2</span>
            <h2 className="font-editorial text-xl font-light text-[#E6DBC7] sm:text-2xl md:text-3xl">
              Join the Weekly Reset
            </h2>
          </div>
          <p className="mb-10 ml-7 text-xs font-light text-[#E6DBC7]/50 sm:ml-10 sm:text-sm md:mb-12 md:text-base">
            A live session every Wednesday to reset and reconnect
          </p>

          {/* Weekly Reset Card - now using shared component */}
          <WeeklyResetCard onClick={() => navigate("/online?tab=live")} />
        </div>

        {/* Closing */}
        <div className="pb-16 pt-6 text-center sm:pb-20 sm:pt-8 md:pb-24">
          <p className="px-4 text-sm font-light text-[#E6DBC7]/50 sm:text-base">
            That's it. Start here, go gently, and trust the process.
          </p>
        </div>

        <OnlineFooter />
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        onShowSubscription={() => setShowSubscriptionModal(true)}
      />

      {/* Subscription Modal */}
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
    </div>
  );
};

export default StartHere;
