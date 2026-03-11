import guestSessionBg from "@/assets/guest-session-bg.png";
import heroHandsSession from "@/assets/hero-hands-session.png";
import weeklyResetEvent from "@/assets/weekly-reset-event.jpg";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { formatGuestSessionDate, getNextThirdThursday, useNextGuestTeacher } from "@/hooks/useNextGuestTeacher";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LiveSessionsData } from "./online/types";
import HomeTab from "./online/HomeTab";
import ProgramsTab from "./online/ProgramsTab";
import LiveTab from "./online/LiveTab";
import Library from "./Library";
import SessionDetailModal from "./SessionDetail";

const Online = () => {
  const { hasSubscription, isAdmin, isTestUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && ['home', 'library', 'programs', 'live'].includes(tab) ? tab : 'home';
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [shouldClearLibraryCategory, setShouldClearLibraryCategory] = useState(false);

  const { teacher: nextGuestTeacher } = useNextGuestTeacher();

  // Sync tab with URL param changes (e.g. back/forward navigation)
  const tabParam = searchParams.get('tab');
  const validTab = tabParam && ['home', 'library', 'programs', 'live'].includes(tabParam) ? tabParam : null;
  if (validTab && validTab !== activeTab) {
    setActiveTab(validTab);
  }

  const liveSessionsData: LiveSessionsData = useMemo(() => ({
    weeklyReset: {
      title: "Weekly Reset",
      subtitle: "Live every Sunday • 7:00 PM GMT • 30 mins",
      description: "A live space to pause, settle your system, and realign mid-week.",
      image: weeklyResetEvent,
      nextDate: "Sunday, December 22",
      isLive: false,
      hasReplay: true,
      replayDate: "December 15, 2024",
    },
    monthlyPresence: {
      title: "Monthly Breath & Presence",
      subtitle: "First Saturday of each month • 10:00 AM GMT • 90 mins",
      description: "A longer, spacious session to soften tension and reconnect with yourself.",
      image: heroHandsSession,
      nextDate: "Saturday, January 4",
      isLive: false,
      hasReplay: true,
      replayDate: "December 7, 2024",
    },
    guestSession: nextGuestTeacher
      ? {
          title: nextGuestTeacher.session_title,
          subtitle: "3rd Thursday of every month • 7:30 PM GMT • 1 hour",
          description: nextGuestTeacher.short_description || `A unique session featuring ${nextGuestTeacher.name} with fresh perspectives.`,
          image: nextGuestTeacher.photo_url || guestSessionBg,
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
          image: guestSessionBg,
          nextDate: formatGuestSessionDate(getNextThirdThursday()),
          isLive: false,
          hasReplay: false,
          teacherName: "Guest Teacher",
          teacherTitle: "",
        },
  }), [nextGuestTeacher]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShouldClearLibraryCategory(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="pt-44 md:pt-72 lg:pt-88 px-6 md:px-10 lg:px-12 pb-24 md:pb-0">
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
        <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      </Suspense>

      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
};

export default Online;
