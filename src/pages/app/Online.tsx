import { Suspense, useState } from "react";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveSessionsData } from "@/hooks/useLiveSessionsData";
import { useOnlineTab } from "@/hooks/useOnlineTab";

import LibraryTab from "./LibraryTab";
import CoursesTab from "./online/CoursesTab";
import HomeTab from "./online/HomeTab";
import LiveTab from "./online/LiveTab";
import SessionDetailModal from "./SessionDetail";

const Online = () => {
  const { hasSubscription, isAdmin, isTestUser } = useAuth();
  const { activeTab, handleTabChange } = useOnlineTab();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSubscriptionRequired = () => {
    setShowSubscriptionModal(true);
  };
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const liveSessionsData = useLiveSessionsData();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="lg:pt-88 px-6 pb-40 pt-44 md:px-10 md:pt-72 lg:px-12">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="home" className="mt-0 pb-24">
            <HomeTab
              liveSessionsData={liveSessionsData}
              hasSubscription={hasSubscription}
              isAdmin={isAdmin}
              isTestUser={isTestUser}
              onSubscriptionRequired={handleSubscriptionRequired}
              onSessionClick={(id) => setSelectedSessionId(id)}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-0 pb-24">
            <LibraryTab isEmbedded={true} />
          </TabsContent>

          <TabsContent value="courses" className="mt-0 pb-24">
            <CoursesTab />
          </TabsContent>

          <TabsContent value="live" className="mt-0 pb-24">
            <LiveTab
              liveSessionsData={liveSessionsData}
              hasSubscription={hasSubscription}
              isAdmin={isAdmin}
              isTestUser={isTestUser}
              onSubscriptionRequired={handleSubscriptionRequired}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

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

export default Online;
