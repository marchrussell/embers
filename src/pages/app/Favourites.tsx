import { useQuery } from "@tanstack/react-query";
import { Heart, Play, Share2 } from "lucide-react";
import { Suspense, useState } from "react";

import favouritesHeroImage from "@/assets/favourites-hero.jpg";
import { ClassPlayerModal } from "@/components/ClassPlayerModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import OnlineHeader from "@/components/OnlineHeader";
import { SessionCardSkeleton } from "@/components/skeletons/SessionCardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { copyLink } from "@/lib/copyLink";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

const Favourites = () => {
  const { user, hasSubscription } = useAuth();
  const { favouriteIds, removeFavourite, loading: favouritesLoading } = useFavourites();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showClassPlayer, setShowClassPlayer] = useState(false);

  const { data: favourites = [], isLoading: loading } = useQuery({
    queryKey: ["favourite-sessions", favouriteIds],
    queryFn: async () => {
      if (!user || favouriteIds.length === 0) return [];

      const { data: classesData, error } = await supabase
        .from("classes")
        .select("*, categories:categories!classes_category_id_fkey(name)")
        .in("id", favouriteIds)
        .eq("is_published", true);

      if (error) throw error;

      return (
        classesData?.map((cls) => ({
          id: cls.id,
          title: cls.title,
          description: cls.description || cls.short_description,
          duration: cls.duration_minutes,
          locked: cls.requires_subscription && !user,
          category: cls.categories?.name || "",
          teacher: cls.teacher_name,
          image: cls.image_url,
        })) || []
      );
    },
    enabled: !favouritesLoading,
  });

  const handleRemoveFavourite = (sessionId: string) => {
    removeFavourite(sessionId);
  };

  const handleShare = (session: any) => {
    const shareUrl = `${window.location.origin}/shared-session/${session.id}`;
    copyLink(shareUrl, "Session link copied to clipboard");
  };

  const handleSessionClick = (sessionId: string, locked: boolean) => {
    if (locked && !hasSubscription) {
      setShowSubscriptionModal(true);
    } else {
      setSelectedClassId(sessionId);
      setShowClassPlayer(true);
    }
  };

  return (
    <>
      <NavBar />
      <OnlineHeader />
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
      <ClassPlayerModal
        classId={selectedClassId}
        open={showClassPlayer}
        onClose={() => {
          setShowClassPlayer(false);
          setSelectedClassId(null);
        }}
      />

      <div className="min-h-screen bg-background pb-24">
        {/* Hero Header - matches StartHere layout */}
        <div className="relative z-10 mt-[340px] h-[420px] md:mt-[380px]">
          <img
            src={favouritesHeroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative flex h-full items-end px-6 pb-14 md:px-10 lg:px-12">
            <div className="w-full">
              <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
                {favourites.length} Sessions Saved
              </p>
              <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">
                Your Favourites
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content - matches StartHere layout */}
        <div className="px-6 pt-16 md:px-10 lg:px-12">
          {loading ? (
            <div className="space-y-3 md:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SessionCardSkeleton key={i} />
              ))}
            </div>
          ) : favourites.length === 0 ? (
            <p className="text-sm leading-relaxed text-white/60 md:text-base">
              You haven't added any favourites yet. Browse the library and tap the heart icon to
              save your favorite sessions.
            </p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {favourites.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id, session.locked)}
                  className="group relative flex cursor-pointer items-center gap-3 overflow-hidden py-2 md:gap-4"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded md:h-24 md:w-24">
                    <img
                      src={getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-[#EC9037] md:mb-1 md:text-sm">
                      {session.category}
                    </p>
                    <h3 className="mb-0.5 truncate text-base font-normal text-white md:text-xl">
                      {session.title}
                    </h3>
                    <p className="text-sm font-light text-white/60 md:text-base">
                      {session.teacher}
                    </p>
                    <p className="text-sm font-light text-white/50 md:text-base">
                      {session.duration} min
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 pr-2 md:gap-2 md:pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavourite(session.id);
                      }}
                      className="p-1.5 transition-all md:p-2"
                    >
                      <Heart
                        className="h-5 w-5 fill-white text-white transition-all"
                        strokeWidth={1.5}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(session);
                      }}
                      className="p-1.5 transition-all md:p-2"
                    >
                      <Share2 className="h-5 w-5 text-white transition-all" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session.id, session.locked);
                      }}
                      className="p-1.5 transition-all md:p-2"
                    >
                      <Play
                        className="h-5 w-5 text-white transition-all"
                        strokeWidth={1.5}
                        fill="none"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Favourites;
