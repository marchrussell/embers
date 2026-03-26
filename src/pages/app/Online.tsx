import { Suspense, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { SafetyDisclosureModal } from "@/components/SafetyDisclosureModal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatGuestSessionDate,
  getNextThirdThursday,
  useNextGuestTeacher,
} from "@/hooks/useNextGuestTeacher";
import {
  guestSessionImg,
  monthlyBreathOnlineImg as monthlyPresenceImg,
  weeklyResetImg,
} from "@/lib/experiencesData";

import Library from "./Library";
import HomeTab from "./online/HomeTab";
import LiveTab from "./online/LiveTab";
import ProgramsTab from "./online/ProgramsTab";
import { LiveSessionsData } from "./online/types";
import SessionDetailModal from "./SessionDetail";

const VALID_TABS = ["home", "library", "programs", "live"];

const Online = () => {
  const {
    hasSubscription,
    isAdmin,
    isTestUser,
    hasAcceptedSafetyDisclosure,
    refreshOnboardingStatus,
    user,
    loading,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const showSafetyModal = !loading && !hasAcceptedSafetyDisclosure;

  const handleSafetyAccept = async () => {
    await refreshOnboardingStatus();
  };
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [shouldClearLibraryCategory, setShouldClearLibraryCategory] = useState(false);

  const { teacher: nextGuestTeacher } = useNextGuestTeacher();

  // Derive active tab from URL — URL is the single source of truth
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "home";

  const liveSessionsData: LiveSessionsData = useMemo(
    () => ({
      weeklyReset: {
        title: "Weekly Reset",
        subtitle: "Live every Sunday • 7:00 PM GMT • 30 mins",
        description: "A live space to pause, settle your system, and realign mid-week.",
        image: weeklyResetImg,
        nextDate: "Sunday, December 22",
        isLive: false,
        hasReplay: true,
        replayDate: "December 15, 2024",
      },
      monthlyPresence: {
        title: "Monthly Breath & Presence",
        subtitle: "First Saturday of each month • 10:00 AM GMT • 90 mins",
        description: "A longer, spacious session to soften tension and reconnect with yourself.",
        image: monthlyPresenceImg,
        nextDate: "Saturday, January 4",
        isLive: false,
        hasReplay: true,
        replayDate: "December 7, 2024",
      },
      guestSession: nextGuestTeacher
        ? {
            title: nextGuestTeacher.session_title,
            subtitle: "3rd Thursday of every month • 7:30 PM GMT • 1 hour",
            description:
              nextGuestTeacher.short_description ||
              `A unique session featuring ${nextGuestTeacher.name} with fresh perspectives.`,
            image: nextGuestTeacher.photo_url || guestSessionImg,
            nextDate: formatGuestSessionDate(new Date(nextGuestTeacher.session_date)),
            isLive: false,
            hasReplay: false,
            teacherName: nextGuestTeacher.name,
            teacherTitle: nextGuestTeacher.title,
          }
        : {
            title: "Guest Session",
            subtitle: "3rd Thursday of every month • 7:30 PM GMT • 1 hour",
            description: "A unique session featuring a guest teacher with fresh perspectives.",
            image: guestSessionImg,
            nextDate: formatGuestSessionDate(getNextThirdThursday()),
            isLive: false,
            hasReplay: false,
            teacherName: "Guest Teacher",
            teacherTitle: "",
          },
    }),
    [nextGuestTeacher]
  );

  const handleTabChange = (tab: string) => {
    navigate(`/online?tab=${tab}`, { replace: true });
    setShouldClearLibraryCategory(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="lg:pt-88 px-6 pb-40 pt-44 md:px-10 md:pt-72 lg:px-12">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="home" className="mt-0 pb-24">
            <HomeTab
              liveSessionsData={liveSessionsData}
              hasSubscription={hasSubscription}
              isAdmin={isAdmin}
              isTestUser={isTestUser}
              onSubscriptionRequired={() => setShowSubscriptionModal(true)}
              onSessionClick={(id) => setSelectedSessionId(id)}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-0 pb-24">
            <Library
              isEmbedded={true}
              shouldClearCategory={shouldClearLibraryCategory}
              onClearCategory={() => setShouldClearLibraryCategory(false)}
            />
          </TabsContent>

          <TabsContent value="programs" className="mt-0">
            <ProgramsTab />
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <LiveTab
              liveSessionsData={liveSessionsData}
              hasSubscription={hasSubscription}
              isAdmin={isAdmin}
              isTestUser={isTestUser}
              onSubscriptionRequired={() => setShowSubscriptionModal(true)}
            />
          </TabsContent>
        </Tabs>

        <div className="block md:hidden">
          <OnlineFooter />
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      {user && (
        <SafetyDisclosureModal
          isOpen={showSafetyModal}
          onAccept={handleSafetyAccept}
          userId={user.id}
        />
      )}

      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
};

export default Online;
