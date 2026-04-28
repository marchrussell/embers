// Library page - Categories: CALM, ENERGY, TRANSFORM, SLEEP, RESILIENCE & CAPACITY
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { ReactElement, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ArcCardsModal } from "@/components/ArcCardsModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import {
  LibraryEmbeddedSkeleton,
  LibraryPageSkeleton,
} from "@/components/skeletons/LibrarySkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";

import CategoryView from "./library/CategoryView";
import { useFavouriteSessions } from "./library/hooks/useFavouriteSessions";
import { useLibraryData } from "./library/hooks/useLibraryData";
import LibraryMainView from "./library/LibraryMainView";
import { useFeaturedSession } from "./online/hooks/useFeaturedSession";
import SessionDetailModal from "./SessionDetail";

interface LibraryTabProps {
  isEmbedded?: boolean;
}

interface LibraryContentProps {
  user: User | null;
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  isEmbedded: boolean;
}

const LibraryContent = ({
  user,
  hasSubscription,
  isAdmin,
  isTestUser,
  isEmbedded,
}: LibraryContentProps) => {
  const { favouriteIds } = useFavourites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get("session");
  });
  const { data: dbUserProfile = null } = useQuery<{ full_name: string } | null>({
    queryKey: ["profile-name", user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return profile ?? null;
    },
    enabled: !!user?.id && !user.user_metadata?.full_name,
  });

  const metadataProfile = user?.user_metadata?.full_name
    ? { full_name: user.user_metadata.full_name as string }
    : null;
  const userProfile = metadataProfile ?? dbUserProfile;
  const [showArcCardsModal, setShowArcCardsModal] = useState(false);
  const nervousSystemProgramRef = useRef<HTMLDivElement>(null);

  // useSuspenseQuery — suspends until data is ready (no isLoading needed)
  const { categoriesWithSessions } = useLibraryData({ hasSubscription, isAdmin, isTestUser });
  const { favouriteSessions } = useFavouriteSessions({
    favouriteIds,
    hasSubscription,
    isAdmin,
    isTestUser,
  });
  const { featuredSession } = useFeaturedSession();

  const activeCategory = useMemo(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoriesWithSessions.length > 0) {
      return categoriesWithSessions.find((cat) => cat.name === categoryParam) ?? null;
    }
    return null;
  }, [searchParams, categoriesWithSessions]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check for scroll intent from URL params
  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (scrollTo === "nervous-system" && nervousSystemProgramRef.current) {
      setTimeout(() => {
        nervousSystemProgramRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [searchParams]);

  // Navigate away after consuming session param — setState is in lazy initializer above
  if (searchParams.get("session")) {
    navigate("/online", { replace: true });
  }

  // Scroll to top when category is selected
  useEffect(() => {
    if (activeCategory) {
      window.scrollTo(0, 0);
    }
  }, [activeCategory]);

  const handleLibraryBack = () => {
    navigate(isEmbedded ? "/online?tab=library" : "/library", { replace: true });
  };

  const handleSessionClick = (sessionId: string) => {
    if (!sessionId) return;
    setSelectedSessionId(sessionId);
  };

  // View selection
  let viewContent: ReactElement;
  if (activeCategory) {
    viewContent = (
      <CategoryView
        category={activeCategory}
        isEmbedded={isEmbedded}
        hasSubscription={hasSubscription}
        onBack={handleLibraryBack}
        onSessionClick={handleSessionClick}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
      />
    );
  } else {
    viewContent = (
      <LibraryMainView
        categoriesWithSessions={categoriesWithSessions}
        favouriteSessions={favouriteSessions}
        userProfile={userProfile}
        user={user}
        isEmbedded={isEmbedded}
        hasSubscription={hasSubscription}
        isLoading={false}
        onCategorySelect={(category) =>
          navigate(
            isEmbedded
              ? `/online?tab=library&category=${encodeURIComponent(category.name)}`
              : `/library?category=${encodeURIComponent(category.name)}`
          )
        }
        onSessionClick={handleSessionClick}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
        onArcCardsOpen={() => setShowArcCardsModal(true)}
      />
    );
  }

  const modals = (
    <>
      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        onShowSubscription={() => setShowSubscriptionModal(true)}
        isFeaturedClass={featuredSession?.id === selectedSessionId}
      />
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
      <ArcCardsModal open={showArcCardsModal} onOpenChange={setShowArcCardsModal} />
    </>
  );

  if (isEmbedded) {
    return (
      <>
        {viewContent}
        {modals}
      </>
    );
  }

  return (
    <>
      <NavBar />
      {viewContent}
      {modals}
    </>
  );
};

const LibraryTab = ({ isEmbedded = false }: LibraryTabProps) => {
  const { user, hasSubscription, isAdmin, isTestUser, loading: authLoading } = useAuth();

  const skeleton = isEmbedded ? <LibraryEmbeddedSkeleton /> : <LibraryPageSkeleton />;

  if (authLoading) return skeleton;

  return (
    <Suspense fallback={skeleton}>
      <LibraryContent
        user={user}
        hasSubscription={hasSubscription}
        isAdmin={isAdmin}
        isTestUser={isTestUser}
        isEmbedded={isEmbedded}
      />
    </Suspense>
  );
};

export default LibraryTab;
