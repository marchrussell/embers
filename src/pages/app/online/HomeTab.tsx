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

  const scrollResets = (direction: 'left' | 'right') => {
    if (quickResetsScrollRef.current) {
      quickResetsScrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth',
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
      <section>
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
          Start Here — Your First Two Weeks
        </h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          A gentle way to arrive — nothing to keep up with.
        </p>
        <StartHereCard />
      </section>

      {/* Quick Resets */}
      {quickResets.length > 0 && (
        <section className="pt-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide">
              Quick Resets
            </h2>
            {quickResets.length > 4 && (
              <div className="hidden md:flex items-center gap-2">
                <IconButton
                  size="sm"
                  onClick={() => scrollResets('left')}
                  disabled={!canScrollLeft}
                  className={!canScrollLeft ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                >
                  <ChevronLeft strokeWidth={1.5} />
                </IconButton>
                <IconButton
                  size="sm"
                  onClick={() => scrollResets('right')}
                  disabled={!canScrollRight}
                  className={!canScrollRight ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                >
                  <ChevronRight strokeWidth={1.5} />
                </IconButton>
              </div>
            )}
          </div>
          <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
            Short practices, ready when you are.
          </p>
          <div
            ref={quickResetsScrollRef}
            onScroll={checkResetsScroll}
            className="flex gap-10 overflow-x-auto pb-4 scrollbar-hide"
          >
            {quickResets.map((session) => {
              const locked = !!session.requires_subscription && !hasSubscription && !isAdmin && !isTestUser;
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
                  className="flex-shrink-0 w-52 cursor-pointer group"
                >
                  <div className="relative w-52 h-52 mb-4 overflow-hidden rounded-lg">
                    <div
                      className="relative w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${getOptimizedImageUrl(session.image_url, IMAGE_PRESETS.thumbnail)}')`,
                        filter: 'brightness(0.98) contrast(0.95) saturate(0.95)',
                      }}
                    >
                      {locked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-5 h-5 text-white/80" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-normal text-white text-base mb-1 line-clamp-2">
                      {session.title}
                    </h3>
                    <p className="text-sm text-white/60 font-light">
                      {session.teacher_name}
                    </p>
                    <p className="text-sm text-white/40 font-light">
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
          <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
            A Place to Land This Week
          </h2>
          <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
            One gentle practice — that's enough.
          </p>
          <SessionPlayCard
            title={featuredSession.title}
            description={featuredSession.short_description || featuredSession.description || ''}
            meta={`${featuredSession.teacher_name} • ${featuredSession.duration_minutes} min • ${featuredSession.intensity} • ${featuredSession.technique}`}
            imageUrl={featuredSession.image_url}
            onClick={() => {
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
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
          Live Rhythm
        </h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          Nothing to keep up with. Just somewhere to come back to.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <CourseCard
            title={liveSessionsData.weeklyReset.title}
            subtitle={liveSessionsData.weeklyReset.subtitle}
            description={liveSessionsData.weeklyReset.description}
            image={liveSessionsData.weeklyReset.image}
            badge={liveSessionsData.weeklyReset.isLive ? "Live Now" : undefined}
            imagePosition="center 70%"
            onClick={() => handleLiveCardClick('/online/live/weekly-reset')}
          />
          <CourseCard
            title={liveSessionsData.monthlyPresence.title}
            subtitle={liveSessionsData.monthlyPresence.subtitle}
            description={liveSessionsData.monthlyPresence.description}
            image={liveSessionsData.monthlyPresence.image}
            badge={liveSessionsData.monthlyPresence.isLive ? "Live Now" : undefined}
            onClick={() => handleLiveCardClick('/online/live/monthly-presence')}
          />
          <CourseCard
            title={liveSessionsData.guestSession.title}
            subtitle={liveSessionsData.guestSession.subtitle}
            description={liveSessionsData.guestSession.description}
            image={liveSessionsData.guestSession.image}
            badge={liveSessionsData.guestSession.isLive ? "Live Now" : undefined}
            imagePosition="center bottom"
            onClick={() => handleLiveCardClick('/online/live/guest-session')}
          />
        </div>
      </section>
    </div>
  );
};

export default HomeTab;
