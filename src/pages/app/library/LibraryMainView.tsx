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
  onScrollFavourites: (direction: "left" | "right") => void;
  onFavouritesScroll: () => void;
  onArcCardsOpen: () => void;
}

const LibraryMainView = memo(
  ({
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
                <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
                  Browse by Category
                </h2>
                <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
                  Move at your own pace — return anytime.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {categoriesWithSessions
                    .filter(
                      (category) => category && category.image && category.name !== "MEDITATIONS"
                    )
                    .map((category) => (
                      <div
                        key={category.id}
                        onClick={() => onCategorySelect(category)}
                        className="group relative h-56 cursor-pointer overflow-hidden rounded-lg transition-all"
                      >
                        <OptimizedImage
                          src={category.image}
                          alt={category.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          optimizationOptions={IMAGE_PRESETS.categoryCard}
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 ${
                            category.name === "AWAKEN" ||
                            category.name === "ENERGY" ||
                            category.name === "RELEASE"
                              ? "bg-black/30"
                              : "bg-black/15"
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="relative flex h-full flex-col justify-end p-6">
                          <h3 className="mb-3 font-editorial text-4xl text-[#E6DBC7]">
                            {category.name}
                          </h3>
                          <p className="text-base font-light text-[#E6DBC7]/70 md:text-lg">
                            {category.sessions.length} sessions
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Favourites Section - Only shown for authenticated users */}
                {user && (
                  <div className="mb-48 mt-24 md:mt-32">
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

                      {favouriteSessions.length > 4 && (
                        <div className="hidden items-center gap-2 md:flex">
                          <IconButton
                            size="sm"
                            onClick={() => onScrollFavourites("left")}
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
                            size="sm"
                            onClick={() => onScrollFavourites("right")}
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
                        onScroll={onFavouritesScroll}
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
                              <div
                                className="relative h-full w-full bg-cover bg-center transition-opacity duration-500"
                                style={{
                                  backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')`,
                                  filter: "brightness(0.98) contrast(0.95) saturate(0.95)",
                                }}
                              >
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
                      <div className="py-8 text-center">
                        <p className="text-base font-light text-white/50">
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
              <div className="mx-auto mb-16 mt-24 max-w-2xl px-6 text-center">
                <p className="mb-2 text-lg font-light leading-relaxed text-white/90 md:text-xl">
                  Looking for deeper, guided support?
                </p>
                <p className="mb-6 text-base font-light leading-relaxed text-white/70 md:text-lg">
                  For those wanting a more personalised, relational process, ARC mentorship is
                  available by application.
                </p>
                <button
                  onClick={onArcCardsOpen}
                  className="inline-flex items-center gap-3 text-base font-light text-white/90 transition-colors hover:text-white"
                >
                  <span>Learn about ARC</span>
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

LibraryMainView.displayName = "LibraryMainView";

export default LibraryMainView;
