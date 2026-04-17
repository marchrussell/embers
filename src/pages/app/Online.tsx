import { Suspense, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveSessionConfigs } from "@/hooks/useLiveSessionConfigs";
import { useNextGuestTeacher } from "@/hooks/useNextGuestTeacher";
import { experienceImages } from "@/lib/cloudImageUrls";
import { formatExperienceDate, getNextDateFromConfig } from "@/lib/experienceDateUtils";

const guestSessionImg = experienceImages.guestSession;
const monthlyPresenceImg = experienceImages.monthlyBreathOnline;
const weeklyResetImg = experienceImages.weeklyReset;

import { SafetyDisclosureModal } from "@/components/SafetyDisclosureModal";

import Library from "./Library";
import CoursesTab from "./online/CoursesTab";
import HomeTab from "./online/HomeTab";
import LiveTab from "./online/LiveTab";
import { LiveSessionCardData } from "./online/types";
import SessionDetailModal from "./SessionDetail";

const VALID_TABS = ["home", "library", "courses", "live"];

// Fallback images keyed by session_type slug
const SESSION_TYPE_IMAGES: Record<string, string> = {
  "weekly-reset": weeklyResetImg,
  "monthly-presence": monthlyPresenceImg,
  "guest-session": guestSessionImg,
};

const Online = () => {
  const {
    hasSubscription,
    isAdmin,
    isTestUser,
    hasAcceptedSafetyDisclosure,
    acceptSafetyDisclosure,
    user,
    loading,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const showSafetyModal = !loading && !hasAcceptedSafetyDisclosure;

  const handleSafetyAccept = () => {
    acceptSafetyDisclosure();
  };
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [shouldClearLibraryCategory, setShouldClearLibraryCategory] = useState(false);

  const { data: configs = [] } = useLiveSessionConfigs();
  console.log("Live session initial data configs: ", configs);
  //todo - we want guest-session type to show the next date of guest teacher for the recurrence_label
  const { teacher: nextGuestTeacher } = useNextGuestTeacher();
  console.log("Live session next guest teacher: ", nextGuestTeacher);
  // Derive active tab from URL — URL is the single source of truth
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "home";

  const liveSessionsData: LiveSessionCardData[] = useMemo(() => {
    return configs.map((config) => {
      const nextDateObj = getNextDateFromConfig(config);
      const nextDate = nextDateObj ? formatExperienceDate(nextDateObj, config.time ?? "") : null;

      const subtitleParts = [
        config.recurrence_label,
        config.time ? `${config.time} ${config.timezone}` : null,
        config.duration,
      ].filter(Boolean);
      const subtitle = subtitleParts.join(" · ");

      const fallbackImage = SESSION_TYPE_IMAGES[config.session_type] ?? guestSessionImg;

      const durationMinutes = config.duration ? parseInt(config.duration) || 60 : 60;

      // Enrich guest-session with live data from live_session_details
      if (config.session_type === "guest-session" && nextGuestTeacher) {
        console.log("Enriching guest-session with next guest teacher data: ", nextGuestTeacher);
        return {
          sessionType: config.session_type,
          title: config.title,
          subtitle,
          description:
            config.subtitle ||
            "A unique session featuring a guest teacher with fresh perspectives.",
          image: fallbackImage,
          nextDate,
          isLive: false,
          time: config.time,
          durationMinutes,
          teacherName: nextGuestTeacher.name,
          teacherTitle: nextGuestTeacher.title,
        };
      }

      return {
        sessionType: config.session_type,
        title: config.title,
        subtitle,
        description: config.subtitle ?? "",
        image: fallbackImage,
        nextDate,
        isLive: false,
        time: config.time,
        durationMinutes,
      };
    });
  }, [configs, nextGuestTeacher]);

  console.log("liveSessionsData formatted: ", liveSessionsData);

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

          <TabsContent value="courses" className="mt-0">
            <CoursesTab />
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

        <OnlineFooter />
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
