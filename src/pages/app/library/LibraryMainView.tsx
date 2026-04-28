import type { User } from "@supabase/supabase-js";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Lock } from "lucide-react";
import { memo, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

import { FadeUp } from "@/components/FadeUp";
import { FeedbackSection } from "@/components/FeedbackSection";
import { OptimizedImage } from "@/components/OptimizedImage";
import { CategoryCardSkeleton } from "@/components/skeletons/CategoryCardSkeleton";
import { IconButton } from "@/components/ui/icon-button";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

import { FavouriteSession, LibraryCategory } from "./types";

interface LibraryMainViewProps {
  categoriesWithSessions: LibraryCategory[];
  favouriteSessions: FavouriteSession[];
  userProfile: { full_name: string } | null;
  user: User | null;
  isEmbedded: boolean;
  hasSubscription: boolean;
  isLoading: boolean;
  onCategorySelect: (category: LibraryCategory) => void;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
  onArcCardsOpen: () => void;
}

const LibraryMainView = memo(
  ({
    categoriesWithSessions,
    favouriteSessions,
    userProfile,
    user,
    isEmbedded,
    hasSubscription,
    isLoading,
    onCategorySelect,
    onSessionClick,
    onSubscriptionRequired,
    onArcCardsOpen,
  }: LibraryMainViewProps) => {
    const {
      ref: favouritesScrollRef,
      canScrollLeft,
      canScrollRight,
      check: checkFavouritesScroll,
      scrollTo: scrollFavourites,
    } = useHorizontalScroll();

    useLayoutEffect(() => {
      checkFavouritesScroll();
    }, [favouriteSessions.length, checkFavouritesScroll]);

    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Sign In / Profile Button - positioned below navbar */}
        {!isEmbedded && (
          <div className="fixed right-8 top-36 z-50 md:right-12 md:top-40 lg:right-16 lg:top-36">
            {user ? (
              <Link
                to="/online/profile"
                className="block cursor-pointer rounded-full border border-white/60 px-6 py-2 text-sm font-light uppercase tracking-wider text-white/90 transition-all hover:border-white hover:bg-white/10"
              >
                {userProfile?.full_name?.split(" ")[0] || "Profile"}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="block cursor-pointer rounded-full border border-white/60 px-6 py-2 text-sm font-light uppercase tracking-wider text-white/90 transition-all hover:border-white hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
          </div>
        )}

        <div className={isEmbedded ? "pt-8 md:pt-[150px]" : "px-6 pt-80 md:pt-96 lg:pt-80"}>
          {isLoading ? (
            <div>
              <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
                Browse by Category
              </h2>
              <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
                Move at your own pace — return anytime.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Categories Grid */}
              <div>
                <FadeUp>
                  <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
                    Browse by Category
                  </h2>
                  <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
                    Move at your own pace — return anytime.
                  </p>
                </FadeUp>
                {(() => {
                  const filteredCategories = categoriesWithSessions.filter(
                    (category) => category && category.image && category.name !== "MEDITATIONS"
                  );
                  const isOdd = filteredCategories.length % 2 !== 0;
                  return (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {filteredCategories.map((category, index) => {
                        const isLastOdd = isOdd && index === filteredCategories.length - 1;
                        return (
                          <FadeUp
                            key={category.id}
                            delay={index * 60}
                            className={isLastOdd ? "md:col-span-2" : ""}
                          >
                            <div
                              onClick={() => onCategorySelect(category)}
                              className="group relative h-72 w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 shadow-glow transition-all hover:border-[#E6DBC7]/25"
                            >
                              <OptimizedImage
                                src={category.image}
                                alt={category.name}
                                className="absolute inset-0 h-full w-full object-cover"
                                optimizationOptions={IMAGE_PRESETS.categoryCard}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="relative flex h-full flex-col justify-end p-6">
                                <h3 className="mb-2 font-editorial text-4xl text-[#E6DBC7]">
                                  {category.name}
                                </h3>
                                <p className="text-sm font-light text-[#E6DBC7]/60 md:text-base">
                                  {category.sessions.length} sessions
                                </p>
                              </div>
                            </div>
                          </FadeUp>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Favourites Section - Only shown for authenticated users */}
                {user && (
                  <div className="mb-48 mt-32 pt-10">
                    <div className="mb-10 flex items-center justify-between">
                      <Link
                        to="/online/favourites"
                        className="group inline-flex items-center gap-3"
                      >
                        <h2 className="text-2xl font-bold text-[#E6DBC7] md:text-3xl">
                          Favourites
                        </h2>
                        <Heart
                          className="h-6 w-6 fill-white text-white transition-colors"
                          strokeWidth={1.5}
                        />
                      </Link>

                      {favouriteSessions.length > 1 && (
                        <div className="flex items-center gap-2">
                          <IconButton
                            onClick={() => scrollFavourites("left")}
                            disabled={!canScrollLeft}
                            className={
                              !canScrollLeft
                                ? "border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none"
                                : ""
                            }
                          >
                            <ChevronLeft strokeWidth={1.5} />
                          </IconButton>
                          <IconButton
                            onClick={() => scrollFavourites("right")}
                            disabled={!canScrollRight}
                            className={
                              !canScrollRight
                                ? "border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none"
                                : ""
                            }
                          >
                            <ChevronRight strokeWidth={1.5} />
                          </IconButton>
                        </div>
                      )}
                    </div>

                    {favouriteSessions.length > 0 ? (
                      <div
                        ref={favouritesScrollRef}
                        onScroll={checkFavouritesScroll}
                        className="scrollbar-hide flex gap-10 overflow-x-auto pb-4"
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
                            className="group w-52 flex-shrink-0 cursor-pointer"
                          >
                            <div className="relative mb-4 h-52 w-52 overflow-hidden rounded-lg">
                              <div className="relative h-full w-full transition-opacity duration-500">
                                <img
                                  src={getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                  style={{
                                    filter: "brightness(0.98) contrast(0.95) saturate(0.95)",
                                  }}
                                />
                                {session.locked && (
                                  <div className="absolute right-2 top-2">
                                    <Lock className="h-5 w-5 text-white/80" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-1">
                              <h3 className="mb-1 line-clamp-2 text-base font-normal text-white">
                                {session.title}
                              </h3>
                              <p className="text-sm font-light text-white/60">{session.teacher}</p>
                              <p className="text-sm font-light text-white/40">
                                {session.duration} min
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-8">
                        <p className="text-base font-light">
                          Sessions you love will appear here. Tap the heart on any practice to save
                          it.
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
              <FadeUp>
                <div className="mx-auto max-w-xl px-6 text-center">
                  <p className="mb-2 text-lg font-semibold leading-relaxed md:text-xl">
                    Looking for deeper, guided support?
                  </p>
                  <p className="mb-6 font-light leading-relaxed">
                    For those wanting a more personalised, relational process, ARC mentorship is
                    available by application.
                  </p>
                  <button
                    onClick={onArcCardsOpen}
                    className="inline-flex items-center gap-3 text-base font-light transition-colors hover:text-white"
                  >
                    <span>Learn about ARC</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </FadeUp>
            </>
          )}
        </div>
      </div>
    );
  }
);

LibraryMainView.displayName = "LibraryMainView";

export default LibraryMainView;
