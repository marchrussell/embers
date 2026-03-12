import { FeedbackSection } from "@/components/FeedbackSection";
import { OptimizedImage } from "@/components/OptimizedImage";
import { CategoryCardSkeleton } from "@/components/skeletons/CategoryCardSkeleton";
import { IconButton } from "@/components/ui/icon-button";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import type { User } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight, Heart, Lock } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { FavouriteSession, LibraryCategory } from "./types";

interface LibraryMainViewProps {
  categoriesWithSessions: LibraryCategory[];
  favouriteSessions: FavouriteSession[];
  favouritesScrollRef: React.RefObject<HTMLDivElement>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  userProfile: { full_name: string } | null;
  user: User | null;
  isEmbedded: boolean;
  hasSubscription: boolean;
  isLoading: boolean;
  onCategorySelect: (category: LibraryCategory) => void;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
  onScrollFavourites: (direction: 'left' | 'right') => void;
  onFavouritesScroll: () => void;
  onArcCardsOpen: () => void;
}

const LibraryMainView = memo(({
  categoriesWithSessions,
  favouriteSessions,
  favouritesScrollRef,
  canScrollLeft,
  canScrollRight,
  userProfile,
  user,
  isEmbedded,
  hasSubscription,
  isLoading,
  onCategorySelect,
  onSessionClick,
  onSubscriptionRequired,
  onScrollFavourites,
  onFavouritesScroll,
  onArcCardsOpen,
}: LibraryMainViewProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sign In / Profile Button - positioned below navbar */}
      {!isEmbedded && (
        <div className="fixed top-36 md:top-40 lg:top-36 right-8 md:right-12 lg:right-16 z-50">
          {user ? (
            <Link
              to="/online/profile"
              className="block px-6 py-2 rounded-full border border-white/60 text-white/90 text-sm font-light tracking-wider uppercase hover:bg-white/10 hover:border-white transition-all cursor-pointer"
            >
              {userProfile?.full_name?.split(' ')[0] || 'Profile'}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="block px-6 py-2 rounded-full border border-white/60 text-white/90 text-sm font-light tracking-wider uppercase hover:bg-white/10 hover:border-white transition-all cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      <div className={isEmbedded ? "pt-8 md:pt-[150px]" : "px-6 pt-80 md:pt-96 lg:pt-80"}>
        {isLoading ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Browse by Category</h2>
            <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Move at your own pace — return anytime.</p>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Browse by Category</h2>
              <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Move at your own pace — return anytime.</p>
              <div className="grid grid-cols-2 gap-6">
                {categoriesWithSessions
                  .filter(category => category && category.image && category.name !== 'MEDITATIONS')
                  .map((category) => (
                    <div
                      key={category.id}
                      onClick={() => onCategorySelect(category)}
                      className="relative overflow-hidden cursor-pointer group rounded-lg transition-all h-56"
                    >
                      <OptimizedImage
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        optimizationOptions={IMAGE_PRESETS.categoryCard}
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 ${
                        category.name === 'AWAKEN' || category.name === 'ENERGY' || category.name === 'RELEASE'
                          ? 'bg-black/30'
                          : 'bg-black/15'
                      }`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-6">
                        <h3 className="text-4xl font-editorial text-[#E6DBC7] mb-3">
                          {category.name}
                        </h3>
                        <p className="text-base md:text-lg font-light text-[#E6DBC7]/70">{category.sessions.length} sessions</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Favourites Section - Only shown for authenticated users */}
              {user && (
                <div className="mt-24 md:mt-32 mb-48">
                  <div className="flex items-center justify-between mb-10">
                    <Link to="/online/favourites" className="group inline-flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-[#E6DBC7]">
                        Favourites
                      </h2>
                      <Heart className="w-6 h-6 text-white fill-white transition-colors" strokeWidth={1.5} />
                    </Link>

                    {favouriteSessions.length > 4 && (
                      <div className="hidden md:flex items-center gap-2">
                        <IconButton
                          size="sm"
                          onClick={() => onScrollFavourites('left')}
                          disabled={!canScrollLeft}
                          className={!canScrollLeft ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                        >
                          <ChevronLeft strokeWidth={1.5} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          onClick={() => onScrollFavourites('right')}
                          disabled={!canScrollRight}
                          className={!canScrollRight ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                        >
                          <ChevronRight strokeWidth={1.5} />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  {favouriteSessions.length > 0 ? (
                    <div
                      ref={favouritesScrollRef}
                      onScroll={onFavouritesScroll}
                      className="flex gap-10 overflow-x-auto pb-4 scrollbar-hide"
                    >
                      {favouriteSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            if (session.locked && !hasSubscription) {
                              onSubscriptionRequired();
                            } else {
                              onSessionClick(session.id);
                            }
                          }}
                          className="flex-shrink-0 w-52 cursor-pointer group"
                        >
                          <div className="relative w-52 h-52 mb-4 overflow-hidden rounded-lg">
                            <div
                              className="relative w-full h-full bg-cover bg-center transition-opacity duration-500"
                              style={{
                                backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')`,
                                filter: 'brightness(0.98) contrast(0.95) saturate(0.95)'
                              }}
                            >
                              {session.locked && (
                                <div className="absolute top-2 right-2">
                                  <Lock className="w-5 h-5 text-white/80" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-normal text-white text-base mb-1 line-clamp-2">
                              {session.title}
                            </h3>
                            <p className="text-sm text-white/60 font-light">
                              {session.teacher}
                            </p>
                            <p className="text-sm text-white/40 font-light">
                              {session.duration} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-white/50 text-base font-light">
                        Sessions you love will appear here. Tap the heart on any practice to save it.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback Section */}
            <div className="mt-1">
              <FeedbackSection />
            </div>

            {/* ARC Mentorship CTA */}
            <div className="mt-24 mb-16 text-center max-w-2xl mx-auto px-6">
              <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed mb-2">
                Looking for deeper, guided support?
              </p>
              <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-6">
                For those wanting a more personalised, relational process, ARC mentorship is available by application.
              </p>
              <button
                onClick={onArcCardsOpen}
                className="inline-flex items-center gap-3 text-white/90 text-base font-light hover:text-white transition-colors"
              >
                <span>Learn about ARC</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

LibraryMainView.displayName = 'LibraryMainView';

export default LibraryMainView;
