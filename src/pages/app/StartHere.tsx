import startHereButterfly from "@/assets/start-here-butterfly.jpg";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { WeeklyResetCard } from "@/components/WeeklyResetCard";
import { supabase } from "@/integrations/supabase/client";
import SessionDetailModal from "@/pages/app/SessionDetail";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StartHere = () => {
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [sessions, setSessions] = useState<{
    breathPractice?: { id: string; title: string; duration: number; image_url: string; description: string };
    somaticPractice?: { id: string; title: string; duration: number; image_url: string; description: string };
  }>({});

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from('classes')
        .select('id, title, duration_minutes, image_url, short_description, description')
        .eq('is_published', true);

      if (data) {
        // Find "The Landing" for morning practice
        const theLanding = data.find(s => 
          s.title?.toLowerCase().includes('landing')
        );
        // Find "Perfect Breath Reset" for breath break
        const perfectBreathReset = data.find(s => 
          s.title?.toLowerCase().includes('perfect breath') || 
          s.title?.toLowerCase().includes('breath reset')
        );

        setSessions({
          breathPractice: theLanding ? {
            id: theLanding.id,
            title: theLanding.title,
            duration: theLanding.duration_minutes || 10,
            image_url: theLanding.image_url || '',
            description: 'Use as a breath break during the day to reset and recalibrate'
          } : undefined,
          somaticPractice: perfectBreathReset ? {
            id: perfectBreathReset.id,
            title: perfectBreathReset.title,
            duration: perfectBreathReset.duration_minutes || 12,
            image_url: perfectBreathReset.image_url || '',
            description: 'Practice once daily in the morning — the first moment you wake up'
          } : undefined
        });
      }
    };

    fetchSessions();
  }, []);

  const handleSessionClick = (sessionId: string) => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Hero Section - positioned to start where tab content begins */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[420px] z-10 mt-[280px] sm:mt-[320px] md:mt-[380px]">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{ backgroundImage: `url('${startHereButterfly}')` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="relative h-full flex items-end px-6 md:px-10 lg:px-12 pb-10 sm:pb-14">
          <div className="w-full">
            <p className="text-[#D4A574] text-xs sm:text-sm tracking-[0.15em] uppercase font-light mb-2 sm:mb-3">
              Your First Two Weeks
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7]">
              A Simple Place to Begin
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-10 lg:px-12 pt-10 sm:pt-14 md:pt-16 pb-16 sm:pb-20 md:pb-24">
        
        {/* Subtitle - moved below hero */}
        <p className="text-lg sm:text-xl md:text-2xl text-[#E6DBC7]/80 font-editorial italic leading-relaxed mb-12 sm:mb-16 md:mb-20">
          No pressure. No expectations. Just a gentle way to arrive.
        </p>

        {/* Introduction Text - no box */}
        <div className="text-white font-light text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mb-10 sm:mb-20 md:mb-28">
          <p>
            This space is designed to help you arrive gently and find your footing — without pressure or expectation. If all you do in your first two weeks is try these few practices and come to the Weekly Reset, that's more than enough.
          </p>
        </div>

        {/* Section 1: Recommended Practices */}
        <div className="mb-16 sm:mb-20 md:mb-28">
          <div className="flex items-baseline gap-3 sm:gap-5 mb-6">
            <span className="text-xl sm:text-2xl md:text-3xl font-editorial text-white">1</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-editorial text-[#E6DBC7] font-light">
              Try These First
            </h2>
          </div>
          <p className="text-[#E6DBC7]/50 font-light mb-8 sm:mb-10 md:mb-12 ml-7 sm:ml-10 text-xs sm:text-sm md:text-base">
            Two gentle practices to help you settle in
          </p>

          <div className="grid gap-4 sm:gap-6">
            {sessions?.somaticPractice && (
              <SessionPlayCard
                title={sessions.somaticPractice.title}
                description={sessions.somaticPractice.description || "Simple, slow, grounding movements"}
                meta={`March Russell • ${sessions.somaticPractice.duration} min`}
                imageUrl={sessions.somaticPractice.image_url}
                onClick={() => handleSessionClick(sessions.somaticPractice!.id)}
                mobileStacked
              />
            )}
            {sessions?.breathPractice && (
              <SessionPlayCard
                title={sessions.breathPractice.title}
                description={sessions.breathPractice.description || "A brief breathwork session to settle your system"}
                meta={`March Russell • ${sessions.breathPractice.duration} min`}
                imageUrl={sessions.breathPractice.image_url}
                onClick={() => handleSessionClick(sessions.breathPractice!.id)}
                mobileStacked
              />
            )}
          </div>
        </div>

        {/* Section 2: Weekly Reset */}
        <div className="mb-10 sm:mb-20 md:mb-28">
          <div className="flex items-baseline gap-3 sm:gap-5 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl md:text-3xl font-editorial text-white">2</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-editorial text-[#E6DBC7] font-light">
              Join the Weekly Reset
            </h2>
          </div>
          <p className="text-[#E6DBC7]/50 font-light mb-10 md:mb-12 ml-7 sm:ml-10 text-xs sm:text-sm md:text-base">
            A live session every Tuesday to reset and reconnect
          </p>

          {/* Weekly Reset Card - now using shared component */}
          <WeeklyResetCard onClick={() => navigate('/online?tab=live')} />
        </div>

        {/* Closing */}
        <div className="text-center pt-6 sm:pt-8 pb-16 sm:pb-20 md:pb-24">
          <p className="text-[#E6DBC7]/50 font-light text-sm sm:text-base italic px-4">
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
