// Library page - Categories: CALM, ENERGY, TRANSFORM, SLEEP, RESILIENCE & CAPACITY
import { NavBar } from "@/components/NavBar";
import { ArcCardsModal } from "@/components/ArcCardsModal";
import { CategoryCardSkeleton } from "@/components/skeletons/CategoryCardSkeleton";
import { FeaturedHeroSkeleton } from "@/components/skeletons/FeaturedHeroSkeleton";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SessionDetailModal from "./SessionDetail";
import { useFavouriteSessions } from "./library/hooks/useFavouriteSessions";
import { useLibraryData } from "./library/hooks/useLibraryData";
import { LibraryCategory, LibraryProgram } from "./library/types";
import CategoryView from "./library/CategoryView";
import ProgramView from "./library/ProgramView";
import LibraryMainView from "./library/LibraryMainView";
import { useFeaturedSession } from "./online/hooks/useFeaturedSession";

interface LibraryProps {
  isEmbedded?: boolean;
  onClearCategory?: () => void;
  shouldClearCategory?: boolean;
}

const Library = ({ isEmbedded = false, onClearCategory, shouldClearCategory = false }: LibraryProps) => {
  const { user, hasSubscription, isAdmin, isTestUser, loading: authLoading } = useAuth();
  const { favouriteIds } = useFavourites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<LibraryProgram | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [showArcCardsModal, setShowArcCardsModal] = useState(false);
  const nervousSystemProgramRef = useRef<HTMLDivElement>(null);
  const favouritesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { categoriesWithSessions, categories, isLoading: isLoadingData } = useLibraryData({ hasSubscription, isAdmin, isTestUser });
  const { favouriteSessions } = useFavouriteSessions({ favouriteIds, hasSubscription, isAdmin, isTestUser });
  const { featuredSession } = useFeaturedSession();

  const checkFavouritesScroll = () => {
    if (favouritesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = favouritesScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollFavourites = (direction: 'left' | 'right') => {
    if (favouritesScrollRef.current) {
      favouritesScrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll state when favourites change
  useEffect(() => {
    checkFavouritesScroll();
  }, [favouriteSessions.length]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Clear selected category when shouldClearCategory changes to true
  useEffect(() => {
    if (shouldClearCategory) {
      setSelectedCategory(null);
      setSelectedProgram(null);
      onClearCategory?.();
    }
  }, [shouldClearCategory, onClearCategory]);

  // Check for scroll intent from URL params
  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'nervous-system' && nervousSystemProgramRef.current) {
      setTimeout(() => {
        nervousSystemProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [searchParams, isLoadingData]);

  // Check for session param from homepage - open session modal immediately
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      setSelectedSessionId(sessionId);
      navigate('/online', { replace: true });
    }
  }, [searchParams, navigate]);

  // Scroll to top when category is selected
  useEffect(() => {
    if (selectedCategory) {
      window.scrollTo(0, 0);
    }
  }, [selectedCategory]);

  // Set profile from user metadata immediately, fallback to DB
  useEffect(() => {
    if (!user?.id) return;

    const metadataName = user.user_metadata?.full_name;
    if (metadataName) {
      setUserProfile({ full_name: metadataName });
      return;
    }

    let cancelled = false;
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (!cancelled && !error && profile?.full_name) {
          setUserProfile(profile);
        }
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  // Handle URL category parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.length > 0) {
      const match = categoriesWithSessions.find(cat => cat.name === categoryParam);
      if (match) setSelectedCategory(match);
    }
  }, [searchParams, categories, categoriesWithSessions]);

  const handleSessionClick = (sessionId: string) => {
    if (!sessionId) return;
    setSelectedSessionId(sessionId);
  };

  // Loading skeleton — respect isEmbedded
  if (authLoading || isLoadingData) {
    if (isEmbedded) {
      return (
        <div className="px-6 pb-24">
          <div className="mb-20 pt-8">
            <div className="h-8 w-40 bg-muted animate-pulse mb-2 rounded" />
            <div className="h-5 w-80 bg-muted/50 animate-pulse mb-10 rounded" />
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="px-6 pt-80 md:pt-96 lg:pt-80 pb-24">
          <div className="container mx-auto max-w-6xl space-y-20">
            <FeaturedHeroSkeleton />
            <div>
              <div className="h-6 w-32 bg-muted animate-pulse mb-8 rounded" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <CategoryCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View selection
  let viewContent;
  if (selectedCategory) {
    viewContent = (
      <CategoryView
        category={selectedCategory}
        isEmbedded={isEmbedded}
        hasSubscription={hasSubscription}
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
      <ArcCardsModal
        open={showArcCardsModal}
        onOpenChange={setShowArcCardsModal}
      />
    </>
  );

  if (isEmbedded) {
    return <>{viewContent}{modals}</>;
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
