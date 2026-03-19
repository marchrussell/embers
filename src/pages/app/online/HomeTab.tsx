import { IconButton } from "@/components/ui/icon-button";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CourseCard from "./components/CourseCard";
import SessionPlayCard from "./components/SessionPlayCard";
import StartHereCard from "./components/StartHereCard";
import { useFeaturedSession } from "./hooks/useFeaturedSession";
import { useStartHereVisibility } from "./hooks/useStartHereVisibility";
import { useQuickResets } from "./hooks/useQuickResets";
import { LiveSessionsData } from "./types";

interface HomeTabProps {
  liveSessionsData: LiveSessionsData;
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  onSubscriptionRequired: () => void;
  onSessionClick: (id: string) => void;
}

const HomeTab = ({
  liveSessionsData,
  hasSubscription,
  isAdmin,
  isTestUser,
  onSubscriptionRequired,
  onSessionClick,
}: HomeTabProps) => {
  const navigate = useNavigate();
  const { featuredSession } = useFeaturedSession();
  const { quickResets } = useQuickResets();
  const showStartHere = useStartHereVisibility();

  const quickResetsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkResetsScroll = () => {
    if (quickResetsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = quickResetsScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkResetsScroll();
  }, [quickResets]);

  const scrollResets = (direction: "left" | "right") => {
    if (quickResetsScrollRef.current) {
      quickResetsScrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  const handleLiveCardClick = (path: string) => {
    if (!hasSubscription && !isAdmin && !isTestUser) {
      onSubscriptionRequired();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-16 pt-8 md:pt-[150px]">
      {/* Start Here — Your First Two Weeks */}
      {showStartHere && (
        <section>
          <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
            Start Here — Your First Two Weeks
          </h2>
          <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
            A gentle way to arrive — nothing to keep up with.
          </p>
          <StartHereCard
            locked={!hasSubscription && !isAdmin && !isTestUser}
            onLockedClick={onSubscriptionRequired}
          />
        </section>
      )}

      {/* Quick Resets */}
      {quickResets.length > 0 && (
        <section className="pt-24">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
              Quick Resets
            </h2>
            {quickResets.length > 4 && (
              <div className="hidden items-center gap-2 md:flex">
                <IconButton
                  size="sm"
                  onClick={() => scrollResets("left")}
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
                  onClick={() => scrollResets("right")}
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
          <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
            Short practices, ready when you are.
          </p>
          <div
            ref={quickResetsScrollRef}
            onScroll={checkResetsScroll}
            className="scrollbar-hide flex gap-10 overflow-x-auto pb-4"
          >
            {quickResets.map((session) => {
              const locked =
                !!session.requires_subscription && !hasSubscription && !isAdmin && !isTestUser;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (locked) {
                      onSubscriptionRequired();
                    } else {
                      onSessionClick(session.id);
                    }
                  }}
                  className="group w-52 flex-shrink-0 cursor-pointer"
                >
                  <div className="relative mb-4 h-52 w-52 overflow-hidden rounded-lg">
                    <div
                      className="relative h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${getOptimizedImageUrl(session.image_url, IMAGE_PRESETS.thumbnail)}')`,
                        filter: "brightness(0.98) contrast(0.95) saturate(0.95)",
                      }}
                    >
                      {locked && (
                        <div className="absolute right-2 top-2">
                          <Lock className="h-5 w-5 text-white/80" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 line-clamp-2 text-base font-normal text-white">
                      {session.title}
                    </h3>
                    <p className="text-sm font-light text-white/60">{session.teacher_name}</p>
                    <p className="text-sm font-light text-white/40">
                      {session.duration_minutes} min
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured This Week */}
      {featuredSession && (
        <section className="pt-24">
          <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
            A Place to Land This Week
          </h2>
          <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
            One gentle practice — that's enough.
          </p>
          <SessionPlayCard
            title={featuredSession.title}
            description={featuredSession.short_description || featuredSession.description || ""}
            meta={[
              featuredSession.teacher_name,
              featuredSession.duration_minutes != null && `${featuredSession.duration_minutes} min`,
              featuredSession.intensity,
              featuredSession.technique,
            ]
              .filter(Boolean)
              .join(" • ")}
            imageUrl={featuredSession.image_url}
            locked={!hasSubscription && !isAdmin && !isTestUser}
            onClick={() => {
              if (!hasSubscription && !isAdmin && !isTestUser) {
                onSubscriptionRequired();
                return;
              }
              if (!featuredSession.id) {
                toast.error("Unable to load session");
                return;
              }
              onSessionClick(featuredSession.id);
            }}
          />
        </section>
      )}

      {/* Live Rhythm */}
      <section className="pt-24">
        <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
          Live Rhythm
        </h2>
        <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
          Nothing to keep up with. Just somewhere to come back to.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <CourseCard
            title={liveSessionsData.weeklyReset.title}
            subtitle={liveSessionsData.weeklyReset.subtitle}
            description={liveSessionsData.weeklyReset.description}
            image={liveSessionsData.weeklyReset.image}
            badge={liveSessionsData.weeklyReset.isLive ? "Live Now" : undefined}
            imagePosition="center 70%"
            locked={!hasSubscription && !isAdmin && !isTestUser}
            onClick={() => handleLiveCardClick("/online/live/weekly-reset")}
          />
          <CourseCard
            title={liveSessionsData.monthlyPresence.title}
            subtitle={liveSessionsData.monthlyPresence.subtitle}
            description={liveSessionsData.monthlyPresence.description}
            image={liveSessionsData.monthlyPresence.image}
            badge={liveSessionsData.monthlyPresence.isLive ? "Live Now" : undefined}
            locked={!hasSubscription && !isAdmin && !isTestUser}
            onClick={() => handleLiveCardClick("/online/live/monthly-presence")}
          />
          <CourseCard
            title={liveSessionsData.guestSession.title}
            subtitle={liveSessionsData.guestSession.subtitle}
            description={liveSessionsData.guestSession.description}
            image={liveSessionsData.guestSession.image}
            badge={liveSessionsData.guestSession.isLive ? "Live Now" : undefined}
            imagePosition="center bottom"
            locked={!hasSubscription && !isAdmin && !isTestUser}
            onClick={() => handleLiveCardClick("/online/live/guest-session")}
          />
        </div>
      </section>
    </div>
  );
};

export default HomeTab;
