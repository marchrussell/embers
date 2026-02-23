import favouritesHeroImage from "@/assets/favourites-hero.jpg";
import { ClassPlayerModal } from "@/components/ClassPlayerModal";
import { NavBar } from "@/components/NavBar";
import { SessionCardSkeleton } from "@/components/skeletons/SessionCardSkeleton";
import OnlineHeader from "@/components/OnlineHeader";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { Heart, Play, Share2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const Favourites = () => {
  const { user, hasSubscription } = useAuth();
  const { favouriteIds, removeFavourite, loading: favouritesLoading } = useFavourites();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showClassPlayer, setShowClassPlayer] = useState(false);

  // Fetch full session data when favouriteIds change
  useEffect(() => {
    const fetchFavouriteSessions = async () => {
      if (!user) {
        setFavourites([]);
        setLoading(false);
        return;
      }

      if (favouriteIds.length === 0) {
        setFavourites([]);
        setLoading(false);
        return;
      }

      try {
        const { data: classesData, error: classError } = await supabase
          .from('classes')
          .select('*, categories:categories!classes_category_id_fkey(name)')
          .in('id', favouriteIds)
          .eq('is_published', true);

        if (classError) throw classError;

        const transformedFavourites = classesData?.map(cls => ({
          id: cls.id,
          title: cls.title,
          description: cls.description || cls.short_description,
          duration: cls.duration_minutes,
          locked: cls.requires_subscription && !user,
          category: cls.categories?.name || '',
          teacher: cls.teacher_name,
          image: cls.image_url
        })) || [];

        setFavourites(transformedFavourites);
      } catch (error) {
        console.error('Error fetching favourites:', error);
        setFavourites([]);
      }

      setLoading(false);
    };

    if (!favouritesLoading) {
      fetchFavouriteSessions();
    }
  }, [favouriteIds, favouritesLoading, user]);

  const handleRemoveFavourite = (sessionId: string) => {
    removeFavourite(sessionId);
  };

  const handleShare = (session: any) => {
    const shareUrl = `${window.location.origin}/shared-session/${session.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
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
        <div className="relative h-[420px] z-10 mt-[340px] md:mt-[380px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ 
              backgroundImage: `url(${favouritesHeroImage})`
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          <div className="relative h-full flex items-end px-6 md:px-10 lg:px-12 pb-14">
            <div className="w-full">
              <p className="text-[#D4A574] text-sm tracking-[0.15em] uppercase font-light mb-3">
                {favourites.length} Sessions Saved
              </p>
              <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7]">
                Your Favourites
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content - matches StartHere layout */}
        <div className="px-6 md:px-10 lg:px-12 pt-16">
          {loading ? (
            <div className="space-y-3 md:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SessionCardSkeleton key={i} />
              ))}
            </div>
          ) : favourites.length === 0 ? (
            <p className="text-sm md:text-base text-white/60 leading-relaxed">You haven't added any favourites yet. Browse the library and tap the heart icon to save your favorite sessions.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {favourites.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id, session.locked)}
                  className="relative overflow-hidden cursor-pointer group flex items-center gap-3 md:gap-4 py-2"
                >
                  {/* Thumbnail */}
                  <div 
                    className="relative w-16 h-16 md:w-24 md:h-24 bg-cover bg-center flex-shrink-0 rounded"
                    style={{ backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')` }}
                  />
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-[#EC9037] font-medium tracking-widest uppercase mb-0.5 md:mb-1">
                      {session.category}
                    </p>
                    <h3 className="text-base md:text-xl font-normal text-white mb-0.5 truncate">
                      {session.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/60 font-light">
                      {session.teacher}
                    </p>
                    <p className="text-sm md:text-base text-white/50 font-light">
                      {session.duration} min
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 md:gap-2 pr-2 md:pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavourite(session.id);
                      }}
                      className="p-1.5 md:p-2 transition-all"
                    >
                      <Heart className="w-5 h-5 text-white fill-white transition-all" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(session);
                      }}
                      className="p-1.5 md:p-2 transition-all"
                    >
                      <Share2 className="w-5 h-5 text-white transition-all" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session.id, session.locked);
                      }}
                      className="p-1.5 md:p-2 transition-all"
                    >
                      <Play className="w-5 h-5 text-white transition-all" strokeWidth={1.5} fill="none" />
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
