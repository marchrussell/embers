import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { SafetyDisclosureModal } from "@/components/SafetyDisclosureModal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveSessionsData } from "@/hooks/useLiveSessionsData";

import LibraryTab from "./LibraryTab";
import CoursesTab from "./online/CoursesTab";
import HomeTab from "./online/HomeTab";
import LiveTab from "./online/LiveTab";
import SessionDetailModal from "./SessionDetail";

const VALID_TABS = ["home", "library", "courses", "live"];

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
  const liveSessionsData = useLiveSessionsData();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "home";

  const handleTabChange = (tab: string) => {
    navigate(`/online?tab=${tab}`, { replace: true });
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
            <LibraryTab /> 
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
