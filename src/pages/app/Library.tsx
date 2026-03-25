// Library page - Categories: CALM, ENERGY, TRANSFORM, SLEEP, RESILIENCE & CAPACITY
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import ProgramView from "./library/ProgramView";
import { LibraryCategory, LibraryProgram } from "./library/types";
import { useFeaturedSession } from "./online/hooks/useFeaturedSession";
import SessionDetailModal from "./SessionDetail";

interface LibraryProps {
  isEmbedded?: boolean;
  onClearCategory?: () => void;
  shouldClearCategory?: boolean;
}

const Library = ({
  isEmbedded = false,
  onClearCategory,
  shouldClearCategory = false,
}: LibraryProps) => {
  const { user, hasSubscription, isAdmin, isTestUser, loading: authLoading } = useAuth();
  const { favouriteIds } = useFavourites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<LibraryProgram | null>(null);
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
  const favouritesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { categoriesWithSessions, isLoading: isLoadingData } = useLibraryData({
    hasSubscription,
    isAdmin,
    isTestUser,
  });
  const { favouriteSessions } = useFavouriteSessions({
    favouriteIds,
    hasSubscription,
    isAdmin,
    isTestUser,
  });
  const { featuredSession } = useFeaturedSession();

  // Adjust state when shouldClearCategory prop changes — avoids setState-in-effect cascade
  const [prevShouldClear, setPrevShouldClear] = useState(shouldClearCategory);
  if (prevShouldClear !== shouldClearCategory && shouldClearCategory) {
    setPrevShouldClear(shouldClearCategory);
    setSelectedCategory(null);
    setSelectedProgram(null);
    onClearCategory?.();
  }

  // Derive selected category from URL param — avoids setState-in-effect cascade
  const urlCategory = useMemo(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoriesWithSessions.length > 0) {
      return categoriesWithSessions.find((cat) => cat.name === categoryParam) ?? null;
    }
    return null;
  }, [searchParams, categoriesWithSessions]);

  const activeCategory = selectedCategory ?? urlCategory;

  const checkFavouritesScroll = () => {
    if (favouritesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = favouritesScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollFavourites = (direction: "left" | "right") => {
    if (favouritesScrollRef.current) {
      favouritesScrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  // Update scroll state when favourites change — useLayoutEffect to measure DOM before paint
  useLayoutEffect(() => {
    checkFavouritesScroll();
  }, [favouriteSessions.length]);

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
  }, [searchParams, isLoadingData]);

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

  const handleBack = () => {
    setSelectedCategory(null);
    if (searchParams.get("category")) {
      navigate("/library", { replace: true });
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (!sessionId) return;
    setSelectedSessionId(sessionId);
  };

  // Loading skeleton — respect isEmbedded
  if (authLoading || isLoadingData) {
    return isEmbedded ? <LibraryEmbeddedSkeleton /> : <LibraryPageSkeleton />;
  }

  // View selection
  let viewContent;
  if (activeCategory) {
    viewContent = (
      <CategoryView
        category={activeCategory}
        isEmbedded={isEmbedded}
        hasSubscription={hasSubscription}
        onBack={handleBack}
        onSessionClick={handleSessionClick}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
      />
    );
  } else if (selectedProgram) {
    viewContent = (
      <ProgramView
        program={selectedProgram}
        hasSubscription={hasSubscription}
        onSessionClick={handleSessionClick}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
      />
    );
  } else {
    viewContent = (
      <LibraryMainView
        categoriesWithSessions={categoriesWithSessions}
        favouriteSessions={favouriteSessions}
        favouritesScrollRef={favouritesScrollRef}
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        userProfile={userProfile}
        user={user}
        isEmbedded={isEmbedded}
        hasSubscription={hasSubscription}
        isLoading={isLoadingData}
        onCategorySelect={setSelectedCategory}
        onSessionClick={handleSessionClick}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
        onScrollFavourites={scrollFavourites}
        onFavouritesScroll={checkFavouritesScroll}
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

export default Library;
